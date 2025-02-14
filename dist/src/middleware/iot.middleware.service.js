"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../user/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class IotMiddlewareService {
    isAuthenticated(req, res, next) {
        // Middleware applay only for iot endpoints (getAccess)
        const endpointsApply = ["/api/iot/getaccess"];
        if (!endpointsApply.includes(req.path)) {
            next();
            return;
        }
        // Check bearer token
        const bearerHeader = req.headers["authorization"];
        // Check if token is valid
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
            jsonwebtoken_1.default.verify(bearerToken, secret, (err, authData) => {
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
                const user = user_model_1.userModel.search("id", "==", authData.id);
                if (!user) {
                    res.status(403).json({ message: "not login, please login" });
                    return;
                }
                next();
            });
        }
        else {
            res.status(403).json({ message: "not login, please login" });
        }
    }
}
exports.default = IotMiddlewareService;
