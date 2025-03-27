import { Router } from "express";
import UserController from "./user.controller";

class UserRoute {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/users", this.userController.getAllUsers);
    this.router.get("/users/:id", this.userController.getUserById);
    this.router.post("/users", this.userController.createUser);
    this.router.put("/users/:id", this.userController.updateUser);
    this.router.delete("/users/:id", this.userController.deleteUser);
    this.router.put("/users/:id/password", this.userController.updatePassword);
  }
}

export default new UserRoute().router;
