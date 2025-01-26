import { Router } from "express";
import AuthController from "./auth.controller";

class AuthRoute {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/login", this.authController.login);
    this.router.post("/register", this.authController.register);
    this.router.post("/logout", this.authController.logout);
    this.router.post("/me", this.authController.me);
  }
}

export default new AuthRoute().router;
