export type SchemaField = "string" | "number" | "boolean";
export type SchemaDefinition = SchemaField | SchemaField[] | SchemaObject;
export interface SchemaObject {
  [key: string]: SchemaDefinition;
}
export interface Schema {
  [key: string]: SchemaDefinition;
}

export type Operator = "==" | "!=" | "<" | ">" | "<=" | ">=";
