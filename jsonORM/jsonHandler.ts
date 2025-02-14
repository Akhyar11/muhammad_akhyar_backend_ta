import fs from "fs";
import crypto from "crypto";
import {
  Operator,
  Schema,
  SchemaDefinition,
  SchemaObject,
} from "./assets/types";

class JsonORM {
  private dataFile: string;
  private logFile: string;
  private schema: Schema;
  private cachedData: any[] = [];
  private relations: Record<string, { model: JsonORM; type: "one-to-one" | "one-to-many" | "many-to-many"; foreignKey: string; localKey: string }> = {};

  /**
   * Creates an instance of the JSON handler.
   *
   * @param modelName - The name of the model for which the JSON handler is being created.
   * @param schema - The schema definition for the model.
   *
   * Initializes the schema with an 'id' field of type string.
   * Sets the data file path based on the model name.
   * Sets the log file path.
   *
   * If the data file does not exist, it creates the necessary directories and initializes the data file with an empty array.
   * If the log file does not exist, it initializes the log file with an empty array.
   */
  constructor(modelName: string, schema: Schema) {
    this.schema = { id: "string", ...schema };
    this.dataFile = "db/" + modelName + "/data.json";
    this.logFile = "db/log.json";
    if (!fs.existsSync(this.dataFile)) {
      fs.mkdirSync("db/" + modelName, { recursive: true });
      fs.writeFileSync(this.dataFile, JSON.stringify([]));
    }
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, JSON.stringify([]));
    }
  }

  private readFile(): any[] {
    if (this.cachedData.length === 0) {
      const data = JSON.parse(fs.readFileSync(this.dataFile, "utf-8"));
      this.cachedData = data;
      return this.cachedData;
    }

    return this.cachedData;
  }

  private writeFile(data: any[]): void {
    fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
  }

  private validateSchema(schema: Schema, data: any): void {
    for (const key in schema) {
      if (!(key in data)) {
        throw new Error(`Missing required field: ${key}`);
      }
      const expectedType = schema[key];
      this.validateField(expectedType, data[key], key);
    }
  }

  private validateField(
    expectedType: SchemaDefinition,
    value: any,
    key: string
  ): void {
    if (typeof expectedType === "string") {
      if (typeof value !== expectedType) {
        throw new Error(
          `Invalid type for field ${key}: expected ${expectedType}, got ${typeof value}`
        );
      }
    } else if (Array.isArray(expectedType)) {
      if (!Array.isArray(value)) {
        throw new Error(
          `Invalid type for field ${key}: expected array, got ${typeof value}`
        );
      }
      for (const item of value) {
        this.validateField(expectedType[0], item, key);
      }
    } else {
      this.validateSchema(expectedType as SchemaObject, value);
    }
  }

  /**
   * Creates a new entry with the provided data.
   *
   * This method generates a unique ID for the new entry, validates the data against the schema,
   * reads the existing data from the file, adds the new entry to the data, and writes the updated
   * data back to the file. It also logs the addition of the new entry.
   *
   * @param data - The data to be added. This should be an object that conforms to the expected schema.
   *
   * @throws Will throw an error if the data does not conform to the schema.
   */
  create(data: any) {
    data = { id: crypto.randomUUID(), ...data };
    this.validateSchema(this.schema, data);

    // Save field only exist on schema
    const filteredData = Object.keys(data)
      .filter((key) => key in this.schema)
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as any);

    const allData = this.readFile();
    allData.push(filteredData);
    this.writeFile(allData);
    this.log(`Added data with ID: ${data.id}`);
  }

  /**
   * Creates multiple data entries, assigns a unique ID to each entry,
   * validates each entry against the provided schema, and writes the
   * entries to a file.
   *
   * @param data - An array of data objects to be created.
   */
  createMany(data: any[]) {
    data.forEach((item) => {
      item.id = crypto.randomUUID();
      this.validateSchema(this.schema, item);
    });
    const allData = [...data, ...this.readFile()];
    this.writeFile(allData);
    this.log(`Added ${data.length} data`);
  }

  /**
   * Reads and returns the contents of a file.
   *
   * @returns {any[]} The contents of the file as an array.
   */
  read(): any[] {
    return this.readFile();
  }

  /**
   * Reads data with options for pagination and field exclusion
   *
   * @param {Object} params - The parameters object
   * @param {Object} [params.options] - Pagination options
   * @param {number} [params.options.limit] - Maximum items to return
   * @param {number} [params.options.offset] - Items to skip
   * @param {string[]} [params.fields] - Fields to exclude from results
   * @returns {any[]} Filtered and paginated data
   */
  readWithOptionsAndFields({
    options = {},
    fields = [],
  }: {
    options?: { limit?: number; offset?: number };
    fields?: string[];
  } = {}): any[] {
    let result = this.readFile();
    const { limit, offset } = options;

    // Apply pagination
    if (typeof offset === "number") {
      result = result.slice(offset);
    }
    if (typeof limit === "number") {
      result = result.slice(0, limit);
    }

    // Remove specified fields
    if (fields.length > 0) {
      result = result.map((item) => {
        const newItem = { ...item };
        fields.forEach((field) => {
          delete newItem[field];
        });
        return newItem;
      });
    }

    return result;
  }

  /**
   * Reads data from a file and returns an array of objects containing only the specified fields.
   *
   * @param {Object} params - The parameters for the function.
   * @param {string[]} params.fields - An array of strings representing the fields to be included in the returned objects.
   * @returns {any[]} An array of objects, each containing only the specified fields.
   */
  readWithFields({ fields }: { fields: string[] }): any[] {
    const allData = this.readFile();
    return allData.map((item) => {
      const newItem: any = {};
      fields.forEach((field) => {
        newItem[field] = item[field];
      });
      return newItem;
    });
  }

  /**
   * Updates an existing data entry with the specified ID.
   *
   * @param id - The unique identifier of the data entry to update.
   * @param data - An object containing the new data to update the entry with.
   *
   * @throws Will throw an error if the data entry with the specified ID is not found.
   * @throws Will throw an error if any field in the data object is not defined in the schema.
   *
   * The method performs the following steps:
   * 1. Reads all data entries from the file.
   * 2. Finds the index of the data entry with the specified ID.
   * 3. Validates and updates only the fields that are defined in the schema.
   * 4. Writes the updated data back to the file.
   * 5. Logs the update operation.
   */
  update(id: string, data: any): void {
    const allData = this.readFile();
    const index = allData.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Data with ID: ${id} not found`);
    }
    const validData = allData[index];

    // Hanya memperbarui field yang ada di schema dan validasi data baru
    for (let key in data) {
      if (key in this.schema) {
        const tempData = { ...validData, [key]: data[key] };
        this.validateSchema(this.schema, tempData);
        validData[key] = data[key];
      } else {
        throw new Error(`Field ${key} is not defined in schema`);
      }
    }

    this.writeFile(allData);
    this.log(`Updated data with ID: ${id}`);
  }

  /**
   * Deletes an item from the data store by its ID.
   *
   * @param {string} id - The ID of the item to delete.
   * @throws {Error} If no item with the given ID is found.
   * @returns {void}
   */
  delete(id: string): void {
    const allData = this.readFile();
    const index = allData.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Data with ID: ${id} not found`);
    }
    allData.splice(index, 1);
    this.writeFile(allData);
    this.log(`Deleted data with ID: ${id}`);
  }

  /**
   * Searches for items in the data that match the specified field, operator, and value.
   *
   * @param {string} field - The field to search within each item.
   * @param {Operator} operator - The operator to use for comparison. Supported operators are:
   *   - "==": Equal to
   *   - "!=": Not equal to
   *   - ">": Greater than
   *   - "<": Less than
   *   - ">=": Greater than or equal to
   *   - "<=": Less than or equal to
   * @param {any} value - The value to compare against the field.
   * @returns {any[]} An array of items that match the search criteria.
   * @throws {Error} If the field does not exist in the data or if an unsupported operator is provided.
   */
  search(field: string, operator: Operator, value: any): any[] {
    const allData = this.readFile();
    return allData.filter((item) => {
      if (!(field in item)) {
        this.log("search error");
        throw new Error(`Field ${field} does not exist in data`);
      }
      switch (operator) {
        case "==":
          this.log("search");
          return item[field] === value;
        case "!=":
          this.log("search");
          return item[field] !== value;
        case ">":
          this.log("search");
          return item[field] > value;
        case "<":
          this.log("search");
          return item[field] < value;
        case ">=":
          this.log("search");
          return item[field] >= value;
        case "<=":
          this.log("search");
          return item[field] <= value;
        default:
          this.log("search error");
          throw new Error(`Unsupported operator: ${operator}`);
      }
    });
  }

  /**
   * Advanced search with pagination and field exclusion
   *
   * @param {Object} params - Search parameters
   * @param {string} params.field - Field to search on
   * @param {Operator} params.operator - Comparison operator
   * @param {any} params.value - Value to compare against
   * @param {Object} [params.options] - Pagination options
   * @param {number} [params.options.limit] - Maximum items to return
   * @param {number} [params.options.offset] - Items to skip
   * @param {string[]} [params.fields] - Fields to exclude from results
   * @returns {any[]} Filtered, paginated and field-excluded data
   */
  advancedSearch({
    field,
    operator,
    value,
    options = {},
    withOutFields = [],
  }: {
    field: string;
    operator: Operator;
    value: any;
    options?: { limit?: number; offset?: number };
    withOutFields?: string[];
  }): any[] {
    try {
      // First apply search
      let result = this.search(field, operator, value);

      // Then apply pagination
      const { limit, offset } = options;
      if (typeof offset === "number") {
        result = result.slice(offset);
      }
      if (typeof limit === "number") {
        result = result.slice(0, limit);
      }

      // Finally remove specified fields
      if (withOutFields.length > 0) {
        result = result.map((item) => {
          const newItem = { ...item };
          withOutFields.forEach((field) => {
            delete newItem[field];
          });
          return newItem;
        });
      }

      return result;
    } catch (error) {
      this.log("advanced search error");
      throw error;
    }
  }

  private log(message: string): void {
    try {
      const logs = JSON.parse(fs.readFileSync(this.logFile, "utf-8"));
      logs.push({ timestamp: new Date().toISOString(), message });
      fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      if (error instanceof SyntaxError) {
        fs.writeFileSync(
          this.logFile,
          JSON.stringify(
            [{ timestamp: new Date().toISOString(), message }],
            null,
            2
          )
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Define a relationship with another model.
   *
   * @param relationName - The name of the relation.
   * @param options - The relation configuration.
   */
  setRelation(
    relationName: string,
    options: {
      model: JsonORM;
      type: "one-to-one" | "one-to-many" | "many-to-many";
      foreignKey: string;
      localKey: string;
    }
  ): void {
    this.relations[relationName] = options;
  }

  /**
   * Retrieve related data for a given item ID.
   *
   * @param id - The ID of the item to retrieve related data for.
   * @param relationName - The name of the relation to fetch.
   */
  getRelated(id: string, relationName: string): any[] | any {
    const relation = this.relations[relationName];
    if (!relation) {
      throw new Error(`Relation ${relationName} is not defined`);
    }

    const allData = this.readFile();
    const item = allData.find((entry) => entry.id === id);
    if (!item) {
      throw new Error(`Item with ID ${id} not found`);
    }

    const { model, type, foreignKey, localKey } = relation;
    const relatedData = model.read();

    if (type === "one-to-one") {
      return relatedData.find((relatedItem) => relatedItem[foreignKey] === item[localKey]);
    } else if (type === "one-to-many") {
      return relatedData.filter((relatedItem) => relatedItem[foreignKey] === item[localKey]);
    } else if (type === "many-to-many") {
      // Example for many-to-many with intermediate table logic
      return relatedData.filter((relatedItem) => relatedItem[foreignKey].includes(item[localKey]));
    }
    return [];
  }

  /**
   * Deletes an item and handles cascading deletion for related data.
   *
   * @param {string} id - The ID of the item to delete.
   */
  deleteWithRelation(id: string): void {
    const allData = this.readFile();
    const index = allData.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Data with ID: ${id} not found`);
    }

    const item = allData[index];

    // Handle cascading delete for relations
    for (const relationName in this.relations) {
      const relation = this.relations[relationName];
      const { model, type, foreignKey, localKey } = relation;

      if (type === "one-to-one") {
        const relatedItem = model.read().find((related) => related[foreignKey] === item[localKey]);
        if (relatedItem) {
          model.deleteWithRelation(relatedItem.id); // Recursive delete
        }
      } else if (type === "one-to-many") {
        const relatedItems = model.read().filter((related) => related[foreignKey] === item[localKey]);
        relatedItems.forEach((relatedItem) => model.deleteWithRelation(relatedItem.id));
      } else if (type === "many-to-many") {
        const relatedItems = model.read().filter((related) => related[foreignKey].includes(item[localKey]));
        relatedItems.forEach((relatedItem) => model.deleteWithRelation(relatedItem.id));
      }
    }

    // Delete the current item
    allData.splice(index, 1);
    this.writeFile(allData);
    this.log(`Deleted data with ID: ${id}`);
  }
}

export default JsonORM;
