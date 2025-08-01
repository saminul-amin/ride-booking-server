import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { RideServices } from "./rider.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const requestRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const payload = {
      ...req.body,
      riderId: decodedToken.userId,
    };

    const result = await RideServices.requestRide(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Ride requested Successfully",
      data: result,
    });
  }
);

const acceptRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const rideId = req.params.id;

    const result = await RideServices.acceptRide(rideId, decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride accepted successfully",
      data: result,
    });
  }
);

const updateRideStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const rideId = req.params.id;
    const { status } = req.body;

    const result = await RideServices.updateRideStatus(
      rideId,
      status,
      decodedToken.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: result,
    });
  }
);

const cancelRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const rideId = req.params.id;
    const { cancellationReason } = req.body;

    const result = await RideServices.cancelRide(
      rideId,
      decodedToken.userId,
      cancellationReason
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride cancelled successfully",
      data: result,
    });
  }
);

const getRideHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await RideServices.getRideHistory(
      decodedToken.userId,
      decodedToken.role
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride history retrieved successfully",
      data: result,
    });
  }
);

const getAllRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RideServices.getAllRides();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rides retrieved successfully",
      data: result,
    });
  }
);

const getSingleRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rideId = req.params.id;

    const result = await RideServices.getSingleRide(rideId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride retrieved successfully",
      data: result,
    });
  }
);

const getAvailableRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RideServices.getAvailableRides();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Available rides retrieved successfully",
      data: result,
    });
  }
);

const rateRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const rideId = req.params.id;
    const { rating, feedback } = req.body;

    const result = await RideServices.rateRide(
      rideId,
      rating,
      feedback,
      decodedToken.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride rated successfully",
      data: result,
    });
  }
);

export const RideControllers = {
  requestRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  getAllRides,
  getSingleRide,
  getAvailableRides,
  rateRide,
};
