import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/AppError";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let accessToken: string | undefined = req.headers.authorization;

      if (!accessToken && req.cookies && req.cookies.accessToken) {
        accessToken = req.cookies.accessToken;
      }

      if (!accessToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "No token received");
      }

      if (accessToken.startsWith("Bearer ")) {
        accessToken = accessToken.slice(7);
      }

      if (!accessToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "No token received");
      }

      const token = accessToken;

      console.log('DEBUG: Checking Auth for token:', token.substring(0, 20) + '...');

      let verifiedToken;
      try {
        verifiedToken = verifyToken(
            token,
            envVars.JWT_ACCESS_SECRET
        ) as JwtPayload;
      } catch (err) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token");
      }

      console.log('DEBUG: Decoded Token:', verifiedToken);

      if (!verifiedToken || !verifiedToken.email) {
          throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token Payload: missing email");
      }

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist in database"); // Changed to 404
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }

      req.user = {
        ...verifiedToken,
        userId: isUserExist._id.toString(), // Ensure we use the existing user's ID
        role: isUserExist.role // Ensure we use actual role
      };
      
      next();
    } catch (error) {
      console.log("CheckAuth Error:", error);
      next(error);
    }
  };
