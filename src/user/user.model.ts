import { Schema } from "../../jsonORM/assets/types";
import JsonORM from "../../jsonORM/jsonHandler";
import { anthropometryModel } from "../anthropometry/antropomerty.model";
import { groqModel } from "../groq/groq.model";
import { profilModel } from "../profil/profil.model";

// User schema interface
export interface IUser {
  id: string;
  username: string;
  password: string;
  jk?: boolean;
  tgl_lahir?: Date;
  token?: string;
}

// User schema definition
export const UserSchema: Schema = {
  id: "string",
  username: "string",
  password: "string",
  jk: "boolean",
  tgl_lahir: "string",
  token: "string",
  iotIsAllowed: "boolean",
};

const userModel = new JsonORM("user", UserSchema);

userModel.setRelation("antropometry", {
  model: anthropometryModel,
  type: "one-to-many",
  foreignKey: "userId",
  localKey: "id"
});

userModel.setRelation("profil", {
  model: profilModel,
  type: "one-to-one",
  foreignKey: "userId",
  localKey: "id"
})

userModel.setRelation("groq", {
  model: groqModel,
  type: "one-to-many",
  foreignKey: "userId",
  localKey: "id"
})

export {userModel}