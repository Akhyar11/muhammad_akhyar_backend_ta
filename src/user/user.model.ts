import { anthropometryModel } from "../anthropometry/antropomerty.model";
import { groqModel } from "../groq/groq.model";
import { profilModel } from "../profil/profil.model";
import FirebaseService from "../../firebaseORM/FirebaseService";
import { firebaseConfig } from "../utils/firebase.config";
import { Schema } from "../../firebaseORM/assets/type";

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

const userModel = new FirebaseService("users", UserSchema, firebaseConfig);

userModel.setRelation("antropometry", {
  model: anthropometryModel,
  type: "one-to-many",
  foreignKey: "userId",
  localKey: "id",
});

userModel.setRelation("profil", {
  model: profilModel,
  type: "one-to-one",
  foreignKey: "userId",
  localKey: "id",
});

userModel.setRelation("groq", {
  model: groqModel,
  type: "one-to-many",
  foreignKey: "userId",
  localKey: "id",
});

export { userModel };
