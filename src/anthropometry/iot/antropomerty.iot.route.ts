import { Router } from "express";
import AnthropometryIotController from "./antropomerty.iot.controller";

class AnthropometryIotRoute {
  public router: Router;
  private anthropometryIotController: AnthropometryIotController;

  constructor() {
    this.router = Router();
    this.anthropometryIotController = new AnthropometryIotController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/iot/data", this.anthropometryIotController.setData);
  }
}

export default new AnthropometryIotRoute().router;
