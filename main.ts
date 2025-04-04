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
import covertationRoute from "./src/groq/groq.route";
import okxRoute from "./src/okx/okx.route";

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
    this.app.use(express.urlencoded({ extended: true }));
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
    this.app.use("/api", covertationRoute);
    this.app.use("/api", okxRoute);
  }

  public getApp(): Application {
    return this.app;
  }
}

// ✅ Ekspor Express app, bukan menjalankan server langsung
const server = new Server();
export default server.getApp();
