import { Request, Response, NextFunction } from "express";
import { userModel } from "../user/user.model";
import jwt from "jsonwebtoken";

// Middleware service for authentication
export default class MiddlewareService {
  public isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Check for not auth endpoints (login, register, logout)
    const notAuthEndpoints = [
      "/api/login",
      "/api/register",
      "/api/logout",
      "/api/iot",
      "/api/me",
      "/api/profils/upload",
      "/api/okx/candles",
      "/api/okx/trigger",
      "/api/iot/data",
      "/api/iot/access",
      "/api/iot/summary",
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

      jwt.verify(bearerToken, secret, async (err, authData) => {
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

        if (!(authData as jwt.JwtPayload).username) {
          res.status(403).json({ message: "not login, please login" });
          return;
        }

        const user = await userModel.search(
          "id",
          "==",
          (authData as jwt.JwtPayload).id
        );

        if (user.length === 0) {
          res.status(403).json({ message: "not login, please login" });
          return;
        }

        next();
      });
    } else {
      res.status(403).json({ message: "Forbidden: No token provided" });
    }
  }
}
