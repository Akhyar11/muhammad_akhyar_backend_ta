import { Request, Response, NextFunction } from "express";
import { userModel } from "../user/user.model";
import jwt from "jsonwebtoken";

export default class IotMiddlewareService {
  public isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
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

      jwt.verify(bearerToken, secret, (err, authData) => {
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

        const user = userModel.search(
          "id",
          "==",
          (authData as jwt.JwtPayload).id
        );

        if (!user) {
          res.status(403).json({ message: "not login, please login" });
          return;
        }

        next();
      });
    } else {
      res.status(403).json({ message: "not login, please login" });
    }
  }
}
