import { Schema } from "../../firebaseORM/assets/type";
import FirebaseService from "../../firebaseORM/FirebaseService";
import { firebaseConfig } from "../utils/firebase.config";

// Profil schema definition
export const ProfilSchema: Schema = {
  userId: "string",
  nama_lengkap: "string",
  avatarUrl: "string",
  summary: "string",
};

export const profilModel = new FirebaseService(
  "profil",
  ProfilSchema,
  firebaseConfig
);
