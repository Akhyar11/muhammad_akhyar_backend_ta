"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const database_1 = require("firebase/database");
class FirebaseService {
    /**
     * Creates an instance of the Firebase handler.
     *
     * @param modelName - The name of the model/collection for which the Firebase handler is being created.
     * @param schema - The schema definition for the model.
     * @param firebaseConfig - Firebase configuration object.
     *
     * Initializes the schema with an 'id' field of type string.
     * Sets up Firebase connection with the appropriate collection name.
     */
    constructor(modelName, schema, firebaseConfig) {
        this.cachedData = [];
        this.relations = {};
        this.schema = Object.assign({ id: "string", created_at: "string", updated_at: "string" }, schema);
        // Initialize Firebase
        this.firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
        this.db = (0, firestore_1.getFirestore)(this.firebaseApp);
        this.rtdb = (0, database_1.getDatabase)(this.firebaseApp);
        this.collectionName = modelName;
        this.updateDataBaseOnSchema();
    }
    updateDataBaseOnSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedData.length === 0) {
                // Load data first if cache is empty
                yield this.readFromFirestore();
            }
            let hasChanges = false;
            const updatedData = this.cachedData.map((item) => {
                let itemChanged = false;
                const updatedItem = Object.assign({}, item);
                // Check each field in the schema
                for (const key in this.schema) {
                    if (!(key in updatedItem)) {
                        // Field exists in schema but not in data, add default value
                        updatedItem[key] = this.getDefaultValueForType(this.schema[key]);
                        itemChanged = true;
                    }
                }
                if (itemChanged) {
                    hasChanges = true;
                }
                return updatedItem;
            });
            // If there are changes, write back to Firestore
            if (hasChanges) {
                yield this.writeToFirestore(updatedData, "overwrite");
                this.cachedData = updatedData;
            }
        });
    }
    getDefaultValueForType(typeDef) {
        if (typeof typeDef === "string") {
            // Handle primitive types
            switch (typeDef) {
                case "string":
                    return "";
                case "number":
                    return 0;
                case "boolean":
                    return false;
                default:
                    return null;
            }
        }
        else if (Array.isArray(typeDef)) {
            // For array types, return an empty array
            return [];
        }
        else {
            // For complex object types, recursively build default object
            const defaultObj = {};
            for (const key in typeDef) {
                defaultObj[key] = this.getDefaultValueForType(typeDef[key]);
            }
            return defaultObj;
        }
    }
    readFromFirestore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedData.length === 0) {
                const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(this.db, this.collectionName));
                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push(Object.assign({ id: doc.id }, doc.data()));
                });
                this.cachedData = data;
                return data;
            }
            return this.cachedData;
        });
    }
    writeToFirestore(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, operation = "add") {
            const batch = (0, firestore_1.writeBatch)(this.db);
            // For complete overwrite operations
            if (operation === "overwrite") {
                // First delete all existing documents
                const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(this.db, this.collectionName));
                querySnapshot.forEach((document) => {
                    batch.delete((0, firestore_1.doc)(this.db, this.collectionName, document.id));
                });
                // Then add all new documents
                data.forEach((item) => {
                    const docRef = (0, firestore_1.doc)(this.db, this.collectionName, item.id);
                    batch.set(docRef, item);
                });
            }
            else {
                // For adding/updating specific documents
                data.forEach((item) => {
                    const docRef = (0, firestore_1.doc)(this.db, this.collectionName, item.id);
                    batch.set(docRef, item);
                });
            }
            yield batch.commit();
            this.cachedData = data;
        });
    }
    validateSchema(schema, data) {
        for (const key in schema) {
            if (!(key in data)) {
                throw new Error(`Missing required field: ${key}`);
            }
            const expectedType = schema[key];
            this.validateField(expectedType, data[key], key);
        }
    }
    validateField(expectedType, value, key) {
        if (typeof expectedType === "string") {
            if (typeof value !== expectedType) {
                throw new Error(`Invalid type for field ${key}: expected ${expectedType}, got ${typeof value}`);
            }
        }
        else if (Array.isArray(expectedType)) {
            if (!Array.isArray(value)) {
                throw new Error(`Invalid type for field ${key}: expected array, got ${typeof value}`);
            }
            for (const item of value) {
                this.validateField(expectedType[0], item, key);
            }
        }
        else {
            this.validateSchema(expectedType, value);
        }
    }
    /**
     * Creates a new entry with the provided data.
     *
     * This method generates a unique ID for the new entry, validates the data against the schema,
     * and adds the new entry to Firestore. It also logs the addition of the new entry.
     *
     * @param data - The data to be added. This should be an object that conforms to the expected schema.
     *
     * @throws Will throw an error if the data does not conform to the schema.
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date().toString();
            const id = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, "auto-ids")).id; // Generate unique ID
            data = Object.assign({ id: id, created_at: timestamp, updated_at: timestamp }, data);
            this.validateSchema(this.schema, data);
            // Save fields that only exist in schema
            const filteredData = Object.keys(data)
                .filter((key) => key in this.schema)
                .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});
            // Add the document to Firestore
            yield (0, firestore_1.setDoc)((0, firestore_1.doc)(this.db, this.collectionName, id), filteredData);
            // Clear cache
            this.cachedData = [];
            // Log operation
            yield this.log(`Added data with ID: ${id}`);
        });
    }
    /**
     * Creates multiple data entries, assigns a unique ID to each entry,
     * validates each entry against the provided schema, and writes the
     * entries to Firestore.
     *
     * @param data - An array of data objects to be created.
     */
    createMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date().toString();
            const batch = (0, firestore_1.writeBatch)(this.db);
            // Process each item
            data.forEach((item) => {
                const id = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, "auto-ids")).id;
                item.id = id;
                item.created_at = timestamp;
                item.updated_at = timestamp;
                this.validateSchema(this.schema, item);
                // Filter for fields in schema
                const filteredItem = Object.keys(item)
                    .filter((key) => key in this.schema)
                    .reduce((obj, key) => {
                    obj[key] = item[key];
                    return obj;
                }, {});
                const docRef = (0, firestore_1.doc)(this.db, this.collectionName, id);
                batch.set(docRef, filteredItem);
            });
            // Commit all writes
            yield batch.commit();
            // Clear cache
            this.cachedData = [];
            // Log operation
            yield this.log(`Added ${data.length} data`);
        });
    }
    /**
     * Reads and returns all documents from the collection.
     *
     * @returns {Promise<any[]>} All documents in the collection.
     */
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readFromFirestore();
        });
    }
    /**
     * Reads data with options for pagination and field exclusion
     *
     * @param {Object} params - The parameters object
     * @param {Object} [params.options] - Pagination options
     * @param {number} [params.options.limit] - Maximum items to return
     * @param {number} [params.options.offset] - Items to skip
     * @param {string[]} [params.fields] - Fields to exclude from results
     * @returns {Promise<any[]>} Filtered and paginated data
     */
    readWithOptionsAndFields() {
        return __awaiter(this, arguments, void 0, function* ({ options = {}, fields = [], } = {}) {
            let result = yield this.readFromFirestore();
            const { limit: limitCount, offset } = options;
            // Apply pagination
            if (typeof offset === "number") {
                result = result.slice(offset);
            }
            if (typeof limitCount === "number") {
                result = result.slice(0, limitCount);
            }
            // Remove specified fields
            if (fields.length > 0) {
                result = result.map((item) => {
                    const newItem = Object.assign({}, item);
                    fields.forEach((field) => {
                        delete newItem[field];
                    });
                    return newItem;
                });
            }
            return result;
        });
    }
    /**
     * Reads data from Firestore and returns an array of objects containing only the specified fields.
     *
     * @param {Object} params - The parameters for the function.
     * @param {string[]} params.fields - An array of strings representing the fields to be included in the returned objects.
     * @returns {Promise<any[]>} An array of objects, each containing only the specified fields.
     */
    readWithFields(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fields }) {
            const allData = yield this.readFromFirestore();
            return allData.map((item) => {
                const newItem = {};
                fields.forEach((field) => {
                    if (field in item) {
                        newItem[field] = item[field];
                    }
                });
                return newItem;
            });
        });
    }
    /**
     * Updates an existing document with the specified ID.
     *
     * @param id - The unique identifier of the document to update.
     * @param data - An object containing the new data to update the document with.
     *
     * @throws Will throw an error if the document with the specified ID is not found.
     * @throws Will throw an error if any field in the data object is not defined in the schema.
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if document exists
            const docRef = (0, firestore_1.doc)(this.db, this.collectionName, id);
            const docSnap = yield (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                throw new Error(`Data with ID: ${id} not found`);
            }
            const validData = docSnap.data();
            // Update only fields that exist in schema and validate the data
            const updates = { updated_at: new Date().toString() };
            for (let key in data) {
                if (key in this.schema) {
                    const tempData = Object.assign(Object.assign({}, validData), { [key]: data[key] });
                    this.validateSchema(this.schema, Object.assign({ id }, tempData));
                    updates[key] = data[key];
                }
                else {
                    throw new Error(`Field ${key} is not defined in schema`);
                }
            }
            // Update the document
            yield (0, firestore_1.updateDoc)(docRef, updates);
            // Clear cache
            this.cachedData = [];
            // Log operation
            yield this.log(`Updated data with ID: ${id}`);
        });
    }
    /**
     * Deletes a document from Firestore by its ID.
     *
     * @param {string} id - The ID of the document to delete.
     * @throws {Error} If no document with the given ID is found.
     * @returns {Promise<void>}
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if document exists
            const docRef = (0, firestore_1.doc)(this.db, this.collectionName, id);
            const docSnap = yield (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                throw new Error(`Data with ID: ${id} not found`);
            }
            // Delete the document
            yield (0, firestore_1.deleteDoc)(docRef);
            // Clear cache
            this.cachedData = [];
            // Log operation
            yield this.log(`Deleted data with ID: ${id}`);
        });
    }
    /**
     * Searches for documents in the collection that match the specified field, operator, and value.
     *
     * @param {string} field - The field to search within each document.
     * @param {Operator} operator - The operator to use for comparison.
     * @param {any} value - The value to compare against the field.
     * @returns {Promise<any[]>} An array of documents that match the search criteria.
     * @throws {Error} If an unsupported operator is provided.
     */
    search(field, operator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const allData = yield this.readFromFirestore();
            // Log operation
            yield this.log("search");
            return allData.filter((item) => {
                if (!(field in item)) {
                    throw new Error(`Field ${field} does not exist in data`);
                }
                switch (operator) {
                    case "==":
                        return item[field] === value;
                    case "!=":
                        return item[field] !== value;
                    case ">":
                        return item[field] > value;
                    case "<":
                        return item[field] < value;
                    case ">=":
                        return item[field] >= value;
                    case "<=":
                        return item[field] <= value;
                    default:
                        throw new Error(`Unsupported operator: ${operator}`);
                }
            });
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
     * @param {string[]} [params.withOutFields] - Fields to exclude from results
     * @returns {Promise<any[]>} Filtered, paginated and field-excluded data
     */
    advancedSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ field, operator, value, options = {}, withOutFields = [], }) {
            try {
                // First apply search
                let result = yield this.search(field, operator, value);
                // Then apply pagination
                const { limit: limitCount, offset } = options;
                if (typeof offset === "number") {
                    result = result.slice(offset);
                }
                if (typeof limitCount === "number") {
                    result = result.slice(0, limitCount);
                }
                // Finally remove specified fields
                if (withOutFields.length > 0) {
                    result = result.map((item) => {
                        const newItem = Object.assign({}, item);
                        withOutFields.forEach((field) => {
                            delete newItem[field];
                        });
                        return newItem;
                    });
                }
                return result;
            }
            catch (error) {
                yield this.log("advanced search error");
                throw error;
            }
        });
    }
    /**
     * Logs a message to the Firebase Realtime Database.
     *
     * @param message - The message to log.
     */
    log(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logsRef = (0, database_1.ref)(this.rtdb, "logs");
                const newLogRef = (0, database_1.push)(logsRef);
                yield (0, database_1.set)(newLogRef, {
                    timestamp: new Date().toISOString(),
                    message,
                    collection: this.collectionName,
                });
            }
            catch (error) {
                console.error("Error writing log:", error);
            }
        });
    }
    /**
     * Define a relationship with another model.
     *
     * @param relationName - The name of the relation.
     * @param options - The relation configuration.
     */
    setRelation(relationName, options) {
        this.relations[relationName] = options;
    }
    /**
     * Retrieve related data for a given item ID.
     *
     * @param id - The ID of the item to retrieve related data for.
     * @param relationName - The name of the relation to fetch.
     */
    getRelated(id, relationName) {
        return __awaiter(this, void 0, void 0, function* () {
            const relation = this.relations[relationName];
            if (!relation) {
                throw new Error(`Relation ${relationName} is not defined`);
            }
            // Get the document
            const docRef = (0, firestore_1.doc)(this.db, this.collectionName, id);
            const docSnap = yield (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                throw new Error(`Item with ID ${id} not found`);
            }
            const item = Object.assign({ id: docSnap.id }, docSnap.data());
            const { model, type, foreignKey, localKey } = relation;
            const relatedData = yield model.read();
            if (type === "one-to-one") {
                return relatedData.find((relatedItem) => relatedItem[foreignKey] === item[localKey]);
            }
            else if (type === "one-to-many") {
                return relatedData.filter((relatedItem) => relatedItem[foreignKey] === item[localKey]);
            }
            else if (type === "many-to-many") {
                // Example for many-to-many with intermediate table logic
                return relatedData.filter((relatedItem) => relatedItem[foreignKey].includes(item[localKey]));
            }
            return [];
        });
    }
    /**
     * Deletes a document and handles cascading deletion for related data.
     *
     * @param {string} id - The ID of the document to delete.
     */
    deleteWithRelation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if document exists
            const docRef = (0, firestore_1.doc)(this.db, this.collectionName, id);
            const docSnap = yield (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                throw new Error(`Data with ID: ${id} not found`);
            }
            const item = Object.assign({ id: docSnap.id }, docSnap.data());
            // Handle cascading delete for relations
            for (const relationName in this.relations) {
                const relation = this.relations[relationName];
                const { model, type, foreignKey, localKey } = relation;
                if (type === "one-to-one") {
                    const relatedItems = yield model.read();
                    const relatedItem = relatedItems.find((related) => related[foreignKey] === item[localKey]);
                    if (relatedItem) {
                        yield model.deleteWithRelation(relatedItem.id); // Recursive delete
                    }
                }
                else if (type === "one-to-many") {
                    const relatedItems = yield model.read();
                    const itemsToDelete = relatedItems.filter((related) => related[foreignKey] === item[localKey]);
                    for (const relatedItem of itemsToDelete) {
                        yield model.deleteWithRelation(relatedItem.id);
                    }
                }
                else if (type === "many-to-many") {
                    const relatedItems = yield model.read();
                    const itemsToDelete = relatedItems.filter((related) => related[foreignKey].includes(item[localKey]));
                    for (const relatedItem of itemsToDelete) {
                        yield model.deleteWithRelation(relatedItem.id);
                    }
                }
            }
            // Delete the document
            yield (0, firestore_1.deleteDoc)(docRef);
            // Clear cache
            this.cachedData = [];
            // Log operation
            yield this.log(`Deleted data with ID: ${id} with relations`);
        });
    }
}
exports.default = FirebaseService;
