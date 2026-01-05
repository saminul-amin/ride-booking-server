import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);



const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK, // Changed to OK
      message: "All users retrieved successfully",
      data: result,
    });
  }
);

const updateUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body;
        const result = await UserServices.updateUserStatus(id, status);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User status updated successfully",
            data: result,
        });
    }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    console.log('DEBUG: getMe req.user:', req.user);
    
    const userId = decodedToken.userId || decodedToken.id || decodedToken._id;
    
    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token: User ID not found");
    }

    const result = await UserServices.getMe(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK, // Changed to OK from CREATED
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  }
);



const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.updateProfile(decodedToken.userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: result.data,
    });
  }
);

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateProfile,
  updateUserStatus
};
