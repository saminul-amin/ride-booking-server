import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import { Driver } from "./driver.model";
import {
  EarningType,
  IDriver,
  ISetOnlineStatusRequest,
  IUpdateLocationRequest,
  OnlineStatus,
} from "./driver.interface";
import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";
import { Types } from "mongoose";

const createDriverProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role !== "driver") {
    throw new AppError(httpStatus.BAD_REQUEST, "User must have driver role");
  }

  const existingDriver = await Driver.findOne({ userId });
  if (existingDriver) {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver Profile already Exists");
  }

  const driver = await Driver.create({
    userId,
    onlineStatus: OnlineStatus.OFFLINE,
    earnings: [],
    stats: {
      totalRides: 0,
      completedRides: 0,
      cancelledRides: 0,
      totalEarnings: 0,
      averageRating: 0,
      onlineHours: 0,
    },
  });

  return driver;
};

const setOnlineStatus = async (
  userId: string,
  payload: ISetOnlineStatusRequest
) => {
  const { status, location } = payload;

  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const user = await User.findById(userId);
  // if(user?.isBlocked) {
  //     throw new AppError(httpStatus.FORBIDDEN, "Driver Account is Blocked")
  // }

  const updateData: any = {
    OnlineStatus: status,
  };

  if (status === OnlineStatus.ONLINE) {
    updateData.lastOnlineAt = new Date();
    if (location) {
      updateData.currentLocation = location;
    }
  } else {
    updateData.lastOfflineAt = new Date();
    if (driver.lastOnlineAt) {
      const onlineTime =
        (new Date().getTime() - driver.lastOnlineAt.getTime()) /
        (1000 * 60 * 60);
      updateData.$inc = { "stats.onlineHours": onlineTime };
    }
  }

  const updatedDriver = await Driver.findOneAndUpdate({ userId }, updateData, {
    new: true,
  }).populate("userId", "name email phoen");

  return updatedDriver;
};

const updateLocation = async (
  userId: string,
  payload: IUpdateLocationRequest
) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  if (driver.onlineStatus === OnlineStatus.OFFLINE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver must be online to update location"
    );
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { userId },
    { currentLocation: payload },
    { new: true }
  ).populate("userId", "name email phone");

  return updatedDriver;
};

const getDriverProfile = async (userId: string) => {
  const driver = await Driver.findOne({ userId }).populate(
    "userId",
    "name email phone"
  );

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  return driver;
};

const getAllDrivers = async () => {
  const drivers = await Driver.find()
    .populate("userId", "name email phone isBlocked")
    .sort({ createdAt: -1 });

  return drivers;
};

const getOnlineDrivers = async () => {
  const drivers = await Driver.find({ onlineStatus: OnlineStatus.ONLINE })
    .populate("userId", "name email, phone")
    .sort({ createdAt: -1 });

  return drivers;
};

const getDriverDashboard = async (userId: string) => {
  const driver = await Driver.findOne({ userId }).populate(
    "userId",
    "name email phone"
  );

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const activeRide = await Ride.findOne({
    driverId: userId,
    status: {
      $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT],
    },
  }).populate("riderId", "name email, phone");

  const pendingRides = await Ride.find({
    status: RideStatus.REQUESTED,
    driverId: { $exists: false },
  })
    .populate("riderId", "name email phone")
    .sort({ createdAt: -1 })
    .limit(10);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayEarnings = driver.earnings
    .filter((earning) => earning.date >= startOfDay)
    .reduce((sum, earning) => sum + earning.amount, 0);

  const weeklyEarnings = driver.earnings
    .filter((earning) => earning.date >= startOfWeek)
    .reduce((sum, earning) => sum + earning.amount, 0);

  const monthlyEarnings = driver.earnings
    .filter((earning) => earning.date >= startOfMonth)
    .reduce((sum, earning) => sum + earning.amount, 0);

  return {
    driver,
    activeRide,
    pendingRides,
    todayEarnings,
    weeklyEarnings,
    monthlyEarnings,
  };
};

const getDriverEarnings = async (userId: string, period?: string) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  let startDate: Date;
  const now = new Date();

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0);
  }

  const filteredEarnings = driver.earnings.filter(
    (earning) => earning.date >= startDate
  );
  const totalEarnings = filteredEarnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );

  return {
    earnings: filteredEarnings,
    totalEarnings,
    period: period || "all",
  };
};

const addDriverEarning = async (
  userId: string,
  type: EarningType,
  amount: number,
  description: string,
  riderId?: string
) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const earning = {
    riderId: riderId ? new Types.ObjectId(riderId) : undefined,
    type,
    amount,
    description,
    date: new Date(),
  };

  const updatedDriver = await Driver.findOneAndUpdate(
    { userId },
    {
      $push: { earnings: earning },
      $inc: { "stats.totalEarnings": amount },
    },
    { new: true }
  ).populate("userId", "name email phone");

  return updatedDriver;
};

const getDriverStats = async (userId: string) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const completedRides = await Ride.find({
    driverId: userId,
    status: RideStatus.COMPLETED,
  }).sort({ completedAt: -1 });

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRides = completedRides.filter(
    (ride) => ride.completedAt && ride.completedAt >= thisMonth
  ).length;

  const monthlyEarnings = driver.earnings
    .filter((earning) => earning.date >= thisMonth)
    .reduce((sum, earning) => sum + earning.amount, 0);

  return {
    basicStats: driver.stats,
    monthlyRides,
    monthlyEarnings,
    recentRides: completedRides.slice(0, 5),
    totalEarningsBreakdown: {
      rideCompletions: driver.earnings
        .filter((e) => e.type === EarningType.RIDE_COMPLETION)
        .reduce((sum, e) => sum + e.amount, 0),
      bonuses: driver.earnings
        .filter((e) => e.type === EarningType.BONUS)
        .reduce((sum, e) => sum + e.amount, 0),
      penalties: driver.earnings
        .filter((e) => e.type === EarningType.PENALTY)
        .reduce((sum, e) => sum + e.amount, 0),
      adjustments: driver.earnings
        .filter((e) => e.type === EarningType.ADJUSTMENT)
        .reduce((sum, e) => sum + e.amount, 0),
    },
  };
};

const updateDriverStats = async (
  userId: string,
  statsUpdate: Partial<IDriver["stats"]>
) => {
  const driver = await Driver.findOneAndUpdate(
    { userId },
    { $set: { stats: statsUpdate } },
    { new: true }
  ).populate("userId", "name email phone");

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  return driver;
};

const deleteDriverProfile = async (userId: string) => {
  const driver = await Driver.findOneAndDelete({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  return { message: "Driver profile deleted successfully" };
};

export const DriverServices = {
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
