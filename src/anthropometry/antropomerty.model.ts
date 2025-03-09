import { Schema } from "../../firebaseORM/assets/type";
import FirebaseService from "../../firebaseORM/FirebaseService";
import { firebaseConfig } from "../utils/firebase.config";

export const AnthropometrySchema: Schema = {
  id: "string",
  userId: "string",
  height: "string",
  weight: "string",
  bmi: "string",
  kms_bb: "string",
  kms_tb: "string",
  age: "number",
  months: "number",
  date: "string",
  notes: "string",
};

export const anthropometryModel = new FirebaseService(
  "anthropometry",
  AnthropometrySchema,
  firebaseConfig
);
