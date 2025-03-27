import { Router } from "express";
import ProfilController from "./profil.controller";
import { upload } from "../middleware/upload.middleware";

class ProfilRoute {
  public router: Router;
  private profilController: ProfilController;

  constructor() {
    this.router = Router();
    this.profilController = new ProfilController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/profils", this.profilController.getAllProfils); // Mendapatkan semua profil
    this.router.get("/profils/:id", this.profilController.getProfilById); // Mendapatkan profil berdasarkan ID
    this.router.get(
      "/profils/user/:userId",
      this.profilController.getProfilByUserId
    ); // Mendapatkan profil berdasarkan userId
    this.router.post("/profils", this.profilController.createProfil); // Menambahkan profil baru
    this.router.put("/profils/:id", this.profilController.updateProfil); // Memperbarui profil berdasarkan ID
    this.router.delete("/profils/:id", this.profilController.deleteProfil); // Menghapus profil berdasarkan ID

    // Rute untuk meng-upload foto pengguna
    this.router.post(
      "/:id/picture",
      upload.single("avatar"),
      this.profilController.uploadProfilePicture
    );
    this.router.get("/:id/picture", this.profilController.getProfilePicture);
    this.router.delete(
      "/:id/picture",
      this.profilController.deleteProfilePicture
    );
  }
}

export default new ProfilRoute().router; // Ekspor instance router
