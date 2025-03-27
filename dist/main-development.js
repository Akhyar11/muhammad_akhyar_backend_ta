"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
// import dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
// Import routes
const auth_route_1 = __importDefault(require("./src/auth/auth.route"));
const user_route_1 = __importDefault(require("./src/user/user.route"));
const profil_route_1 = __importDefault(require("./src/profil/profil.route"));
const antropomerty_iot_route_1 = __importDefault(require("./src/anthropometry/iot/antropomerty.iot.route"));
const antropomerty_route_1 = __importDefault(require("./src/anthropometry/antropomerty.route")); // Fixed typo in variable name
const groq_route_1 = __importDefault(require("./src/groq/groq.route"));
// Import middleware services
const auth_middleware_service_1 = __importDefault(require("./src/middleware/auth.middleware.service"));
const iot_middleware_service_1 = __importDefault(require("./src/middleware/iot.middleware.service"));
class Server {
    constructor() {
        this.middlewareService = new auth_middleware_service_1.default();
        this.iotMiddlewareService = new iot_middleware_service_1.default();
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.configureMiddleware();
        this.configureRoutes();
    }
    configureMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use((0, express_fileupload_1.default)());
        this.app.use(this.middlewareService.isAuthenticated.bind(this.middlewareService));
        this.app.use(this.iotMiddlewareService.isAuthenticated.bind(this.iotMiddlewareService));
    }
    configureRoutes() {
        this.app.use("/api", auth_route_1.default);
        this.app.use("/api", user_route_1.default);
        this.app.use("/api", profil_route_1.default);
        this.app.use("/api", antropomerty_iot_route_1.default);
        this.app.use("/api", antropomerty_route_1.default); // Fixed typo in variable name
        this.app.use("/api", groq_route_1.default);
    }
    getApp() {
        return this.app;
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }
}
exports.Server = Server;
const server = new Server();
server.start();
