"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../user/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware service for authentication
class MiddlewareService {
    isAuthenticated(req, res, next) {
        // Check for not auth endpoints (login, register, logout)
        const notAuthEndpoints = [
            "/api/login",
            "/api/register",
            "/api/logout",
            "/api/iot",
            "/api/me",
            "/api/profils/upload",
            "/api/iot/data",
            "/api/iot/access",
        ];
        if (notAuthEndpoints.includes(req.path)) {
            next();
            return;
        }
        // Check bearer token
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== "undefined") {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            // Verify token
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(500).json({
                    message: "Internal Server Error: JWT secret is not defined",
                });
                return;
            }
            jsonwebtoken_1.default.verify(bearerToken, secret, (err, authData) => __awaiter(this, void 0, void 0, function* () {
                // If token is invalid
                if (err) {
                    res.status(403).json({ message: "not login, please login" });
                    return;
                }
                // Check authData.id is in the database
                if (!authData) {
                    res.status(403).json({ message: "not login, please login" });
                    return;
                }
                if (!authData.username) {
                    res.status(403).json({ message: "not login, please login" });
                    return;
                }
                const user = yield user_model_1.userModel.search("id", "==", authData.id);
                if (user.length === 0) {
                    res.status(403).json({ message: "not login, please login" });
                    return;
                }
                next();
            }));
        }
        else {
            res.status(403).json({ message: "Forbidden: No token provided" });
        }
    }
}
exports.default = MiddlewareService;
