import { Router } from "express";
import GroqController from "./groq.controller";

class ConvertationRoute {
  public router: Router;
  private groqController: GroqController;

  constructor() {
    this.router = Router();
    this.groqController = new GroqController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/convertation", this.groqController.getConvertation);
    this.router.post("/convertation", this.groqController.createConvertation);
  }
}

export default new ConvertationRoute().router;
