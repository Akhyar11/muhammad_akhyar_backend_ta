import { Router } from "express";
import OKXController from "./okx.controller";

class OKXRoute {
  public router: Router;
  private okxController: OKXController;

  constructor() {
    this.router = Router();
    this.okxController = new OKXController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/okx/candles", this.okxController.getMarketData); // Mendapatkan semua profil
    this.router.post("/okx/trigger", this.okxController.sendWebhook); // Mendapatkan semua profil
  }
}

export default new OKXRoute().router; // Ekspor instance router
