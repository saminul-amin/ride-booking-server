import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { DriverServices } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createDriverProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverServices.createDriverProfile(
      decodedToken.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Driver Profile Created Successfully",
      data: result,
    });
  }
);

const setOnlineStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    console.log("Decoded Token:", decodedToken);
    console.log("Request Body:", req.body);

    const result = await DriverServices.setOnlineStatus(
      decodedToken.userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Online status updated successfully",
      data: result,
    });
  }
);

const updateLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverServices.updateLocation(
      decodedToken.userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Location Updated Successfully",
      data: result,
    });
  }
);

const getDriverProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverServices.getDriverProfile(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver profile retrieved successfully",
      data: result,
    });
  }
);

const getAllDrivers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DriverServices.getAllDrivers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All drivers retrieved successfully",
      data: result,
    });
  }
);

const getOnlineDrivers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DriverServices.getOnlineDrivers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Online drivers retrieved successfully",
      data: result,
    });
  }
);

const getDriverDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverServices.getDriverDashboard(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver dashboard retrieved successfully",
      data: result,
    });
  }
);

const getDriverEarnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const period = req.query.period as string;

    const result = await DriverServices.getDriverEarnings(
      decodedToken.userId,
      period
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver earnings retrieved successfully",
      data: result,
    });
  }
);

const addDriverEarning = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverUserId = req.params.id;
    const { type, amount, description, riderId } = req.body;

    const result = await DriverServices.addDriverEarning(
      driverUserId,
      type,
      amount,
      description,
      riderId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver earning added successfully",
      data: result,
    });
  }
);

const getDriverStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverServices.getDriverStats(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver stats retrieved successfully",
      data: result,
    });
  }
);

const updateDriverStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverUserId = req.params.id;

    const result = await DriverServices.updateDriverStats(
      driverUserId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver stats updated successfully",
      data: result,
    });
  }
);

const deleteDriverProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverUserId = req.params.id;

    console.log("Driver User ID to delete:", driverUserId);

    const result = await DriverServices.deleteDriverProfile(driverUserId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver profile deleted successfully",
      data: result,
    });
  }
);

export const DriverControllers = {
  createDriverProfile,
  setOnlineStatus,
  updateLocation,
  getDriverProfile,
  getAllDrivers,
  getOnlineDrivers,
  getDriverDashboard,
  getDriverEarnings,
  addDriverEarning,
  getDriverStats,
  updateDriverStats,
  deleteDriverProfile,
};
