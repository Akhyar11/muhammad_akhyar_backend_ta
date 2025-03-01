import { Router } from "express";
import AnthropometryController from "./antropomerty.controller";

class AnthropometryRoute {
  public route: Router;
  public anthropometryController: AnthropometryController;

  constructor() {
    this.route = Router();
    this.anthropometryController = new AnthropometryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.route.get(
      "/antropomerty/list/:id",
      this.anthropometryController.getAllById
    );

    this.route.get(
      "/antropomerty/download/:id",
      this.anthropometryController.exportToExcel
    );
  }
}

export default new AnthropometryRoute().route;
