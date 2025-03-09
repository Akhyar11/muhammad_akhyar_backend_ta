import { Schema } from "../../firebaseORM/assets/type";
import FirebaseService from "../../firebaseORM/FirebaseService";
import { firebaseConfig } from "../utils/firebase.config";

export const GroqSchema: Schema = {
  userId: "string",
  title: "string",
};

export const ConvertationSchema: Schema = {
  userId: "string",
  userMessage: "string",
  AIMessage: "string",
};

const groqModel = new FirebaseService("groq", GroqSchema, firebaseConfig);
const convertationModel = new FirebaseService(
  "convertation",
  ConvertationSchema,
  firebaseConfig
);

groqModel.setRelation("convertation", {
  model: convertationModel,
  type: "one-to-many",
  foreignKey: "groqId",
  localKey: "id",
});

export { groqModel, convertationModel };
