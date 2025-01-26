import { Schema } from "../../jsonORM/assets/types";
import JsonORM from "../../jsonORM/jsonHandler";

// Profil schema definition
export const ProfilSchema: Schema = {
  userId: "string",
  nama_lengkap: "string",
  avatarUrl: "string",
};

export const profilModel = new JsonORM("profil", ProfilSchema);
