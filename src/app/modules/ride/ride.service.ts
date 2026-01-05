import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import httpStatus from "http-status-codes";
import { Ride } from "./ride.model";
import { Types } from "mongoose";
import { Driver } from "../driver/driver.model";

const requestRide = async (payload: Partial<IRide>) => {
  const { riderId, pickupLocation, destinationLocation, paymentMethod, fare } = payload;

  const rider = await User.findById(riderId);
  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider Not Found");
  }

  // if(rider.isBlocked) {
  //     throw new AppError(httpStatus.FORBIDDEN, "Rider account is blocked");
  // }

  const activeRide = await Ride.findOne({
    riderId,
    status: {
      $in: [
        RideStatus.REQUESTED,
        RideStatus.ACCEPTED,
        RideStatus.PICKED_UP,
        RideStatus.IN_TRANSIT,
      ],
    },
  });

  console.log("Active Ride:", activeRide);

  if (activeRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You alread have an active ride"
    );
  }

  const ride = await Ride.create({
    riderId,
    pickupLocation,
    destinationLocation,
    paymentMethod,
    fare,
    status: RideStatus.REQUESTED,
    requestedAt: new Date(),
    statusHistory: [
      {
        status: RideStatus.REQUESTED,
        timeStamp: new Date(),
        updatedBy: riderId as Types.ObjectId,
      },
    ],
  });

  console.log("New Ride Created:", ride);

  return ride;
};

const acceptRide = async (rideId: string, driverId: string) => {
  const driver = await Driver.findOne({ userId: driverId }).populate("userId");
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  if ((driver.userId as any).isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Driver account is blocked");
  }
  if (driver.onlineStatus === "offline") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver must be online to accept rides"
    );
  }

  const activeRide = await Ride.findOne({
    driverId,
    status: {
      $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT],
    },
  });

  if (activeRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver already has an active ride"
    );
  }

  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  if (ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride is not available for acceptance"
    );
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    {
      driverId,
      status: RideStatus.ACCEPTED,
      acceptedAt: new Date(),
      $push: {
        statusHistory: {
          status: RideStatus.ACCEPTED,
          timestamp: new Date(),
          updatedBy: driverId,
        },
      },
    },
    { new: true }
  )
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone");

  await Driver.findOneAndUpdate(
    { userId: driverId },
    { currentRiderId: rideId }
  );

  return updatedRide;
};

const updateRideStatus = async (
  rideId: string,
  status: RideStatus,
  updatedBy: string
) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  const validTransitions: { [key: string]: RideStatus[] } = {
    [RideStatus.ACCEPTED]: [RideStatus.PICKED_UP, RideStatus.CANCELLED],
    [RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT, RideStatus.CANCELLED],
    [RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
  };

  if (!validTransitions[ride.status]?.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${ride.status} to ${status}`
    );
  }

  const updateData: any = {
    status,
    $push: {
      statusHistory: {
        status,
        timestamp: new Date(),
        updatedBy,
      },
    },
  };

  switch (status) {
    case RideStatus.PICKED_UP:
      updateData.pickedUpAt = new Date();
      break;
    case RideStatus.IN_TRANSIT:
      updateData.inTransitAt = new Date();
      break;
    case RideStatus.COMPLETED:
      updateData.completedAt = new Date();
      break;
    case RideStatus.CANCELLED:
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = updatedBy;
      break;
  }

  const updatedRide = await Ride.findByIdAndUpdate(rideId, updateData, {
    new: true,
  })
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone");

  if (status === RideStatus.COMPLETED && ride.driverId) {
    await updateDriverStatsOnCompletion(
      ride.driverId.toString(),
      ride.fare || 0
    );
  }

  if (
    [RideStatus.COMPLETED, RideStatus.CANCELLED].includes(status) &&
    ride.driverId
  ) {
    await Driver.findOneAndUpdate(
      { userId: ride.driverId },
      { $unset: { currentRiderId: 1 } }
    );
  }

  return updatedRide;
};

const cancelRide = async (
  rideId: string,
  cancelledBy: string,
  cancellationReason: string
) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if ([RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride cannot be cancelled");
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    {
      status: RideStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy,
      cancellationReason,
      $push: {
        statusHistory: {
          status: RideStatus.CANCELLED,
          timestamp: new Date(),
          updatedBy: cancelledBy,
        },
      },
    },
    { new: true }
  )
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone");

  if (ride.driverId) {
    await Driver.findOneAndUpdate(
      { userId: ride.driverId },
      {
        $inc: { "stats.cancelledRides": 1 },
        $unset: { currentRiderId: 1 },
      }
    );
  }

  return updatedRide;
};

const getRideHistory = async (userId: string, role: string, queryParams: any) => {
  const { page = 1, limit = 10, status, date } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};

  if (role === "rider") {
    query.riderId = userId;
  } else if (role === "driver") {
    query.driverId = userId;
  } else if (role === "admin") {
      if (queryParams.riderId) query.riderId = queryParams.riderId;
      if (queryParams.driverId) query.driverId = queryParams.driverId;

      if (queryParams.riderName) {
          const riders = await User.find({ 
              name: { $regex: queryParams.riderName, $options: 'i' }, 
              role: 'rider' 
          }).select('_id');
          const riderIds = riders.map(r => r._id);
          // If we already have a riderId filter, we should intersect or override. 
          // For simplicity here, name search implies filtering by the IDs found.
          // If multiple riders match, we want rides from ANY of them.
          query.riderId = { $in: riderIds };
      }

      if (queryParams.driverName) {
          const drivers = await User.find({ 
              name: { $regex: queryParams.driverName, $options: 'i' }, 
              role: 'driver' 
          }).select('_id');
          const driverIds = drivers.map(d => d._id);
          query.driverId = { $in: driverIds };
      }
  }

  if (status && status !== 'all') {
      query.status = status;
  }

  if (date) {
      // Simple date matching (start of day to end of day)
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(queryDate.getDate() + 1);
      
      query.createdAt = {
          $gte: queryDate,
          $lt: nextDay
      };
  }

  const rides = await Ride.find(query)
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Ride.countDocuments(query);

  return {
      rides,
      meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPage: Math.ceil(total / Number(limit))
      }
  };
};

const getAllRides = async () => {
  const rides = await Ride.find()
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone")
    .sort({ createdAt: -1 });

  return rides;
};

const getSingleRide = async (rideId: string) => {
  const ride = await Ride.findById(rideId)
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone");

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  return ride;
};

const getAvailableRides = async () => {
  const rides = await Ride.find({ status: RideStatus.REQUESTED })
    .populate("riderId", "name email phone")
    .sort({ requestedAt: 1 });

  return rides;
};

const rateRide = async (
  rideId: string,
  rating: number,
  feedback?: string,
  userId?: string
) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (ride.status !== RideStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Can only rate completed rides");
  }

  if (ride.riderId.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only rate your own rides"
    );
  }

  if (ride.rating) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride has already been rated");
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    { rating, feedback },
    { new: true }
  )
    .populate("riderId", "name email phone")
    .populate("driverId", "name email phone");

  // Update driver's average rating
  if (ride.driverId) {
    await updateDriverRating(ride.driverId.toString());
  }

  return updatedRide;
};

const updateDriverStatsOnCompletion = async (
  driverId: string,
  fare: number
) => {
  const driver = await Driver.findOne({ userId: driverId });
  if (driver) {
    await Driver.findOneAndUpdate(
      { userId: driverId },
      {
        $inc: {
          "stats.totalRides": 1,
          "stats.completedRides": 1,
          "stats.totalEarnings": fare,
        },
        $push: {
          earnings: {
            type: "ride_completion",
            amount: fare,
            description: "Ride completion payment",
            date: new Date(),
          },
        },
      }
    );
  }
};

const updateDriverRating = async (driverId: string) => {
  const completedRides = await Ride.find({
    driverId,
    status: RideStatus.COMPLETED,
    rating: { $exists: true, $ne: null },
  });

  if (completedRides.length > 0) {
    const totalRating = completedRides.reduce(
      (sum, ride) => sum + (ride.rating || 0),
      0
    );
    const averageRating = totalRating / completedRides.length;

    await Driver.findOneAndUpdate(
      { userId: driverId },
      { "stats.averageRating": Math.round(averageRating * 100) / 100 }
    );
  }
};

const estimateFare = async (pickup: string, destination: string) => {
  // Simulate distance calculation (random between 2 and 20 km)
  const distance = Math.floor(Math.random() * 18) + 2; 
  // Base fare $50 + $10 per km
  const fare = 50 + (distance * 10);
  // Simulate duration (2 mins per km)
  const duration = distance * 2;

  return {
    fare,
    distance,
    duration,
    currency: "BDT"
  };
};

const getAdminAnalytics = async () => {
    // 1. Total Users (Riders + Drivers)
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalRiders = await User.countDocuments({ role: 'rider' });

    // 2. Active Rides
    const activeRides = await Ride.countDocuments({
        status: { $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] }
    });

    // 3. Total Revenue & Completed Rides
    const revenueStats = await Ride.aggregate([
        { $match: { status: RideStatus.COMPLETED } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$fare" },
                completedRides: { $sum: 1 }
            }
        }
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const completedRides = revenueStats[0]?.completedRides || 0;

    // 4. Volume (Last 7 Days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const volumeStats = await Ride.aggregate([
        { $match: { createdAt: { $gte: last7Days } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return {
        totalUsers,
        totalDrivers,
        totalRiders,
        activeRides,
        totalRevenue,
        completedRides,
        volumeStats
    };
};

export const RideServices = {
  requestRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  getAllRides,
  getSingleRide,
  getAvailableRides,
  rateRide,
  estimateFare,
  getAdminAnalytics
};
