import { Schema } from "../../jsonORM/assets/types";
import JsonORM from "../../jsonORM/jsonHandler";

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

export const userModel = new JsonORM("user", UserSchema);
