import { Schema } from "../../jsonORM/assets/types";
import JsonORM from "../../jsonORM/jsonHandler";

export const AnthropometrySchema: Schema = {
  id: "string",
  userId: "string",
  height: "string",
  weight: "string",
  bmi: "string",
  ksm: "string",
  age: "number",
  months: "number",
  date: "string",
  notes: "string",
};

export const anthropometryModel = new JsonORM(
  "anthropometry",
  AnthropometrySchema
);
