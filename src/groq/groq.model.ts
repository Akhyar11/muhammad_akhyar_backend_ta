import { Schema } from "../../jsonORM/assets/types";
import JsonORM from "../../jsonORM/jsonHandler";

export const GroqSchema: Schema = {
  userId: "string",
  title: "string",
};

export const ConvertationSchema: Schema = {
  userId: "string",
  userMessage: "string",
  AIMessage: "string",
};

const groqModel = new JsonORM("groq", GroqSchema);
const convertationModel = new JsonORM("convertation", ConvertationSchema);

groqModel.setRelation("convertation", {
  model: convertationModel,
  type: "one-to-many",
  foreignKey: "groqId",
  localKey: "id",
});

export { groqModel, convertationModel };
