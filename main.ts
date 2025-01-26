// import dependencies
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

// Import routes
import authRoute from "./src/auth/auth.route";
import userRoute from "./src/user/user.route";
import profilRoute from "./src/profil/profil.route";
import anthropometryIotRoute from "./src/anthropometry/iot/antropomerty.iot.route";
import anthropometyRoute from "./src/anthropometry/antropomerty.route";

// Import middleware services
import MiddlewareService from "./src/middleware/auth.middleware.service";
import IotMiddlewareService from "./src/middleware/iot.middleware.service";

export class Server {
  private app: Application;
  private port: number | string;
  private middlewareService = new MiddlewareService();
  private iotMiddlewareService = new IotMiddlewareService();

  constructor() {
    dotenv.config();
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(fileUpload());
    this.app.use(this.middlewareService.isAuthenticated);
    this.app.use(this.iotMiddlewareService.isAuthenticated);
  }

  private configureRoutes(): void {
    this.app.use("/api", authRoute);

    this.app.use("/api", userRoute);
    this.app.use("/api", profilRoute);
    this.app.use("/api", anthropometryIotRoute);
    this.app.use("/api", anthropometyRoute);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

const server = new Server();
server.start();
