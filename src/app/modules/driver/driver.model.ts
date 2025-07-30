import { model, Schema } from "mongoose";
import {
  EarningType,
  IDriver,
  IDriverEarnings,
  IDriverStats,
  OnlineStatus,
} from "./driver.interface";

const currentLocationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  { _id: false, versionKey: false }
);

const driverEarningSchema = new Schema<IDriverEarnings>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "Ride" },
    type: { type: String, enum: Object.values(EarningType), required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false, versionKey: false }
);

const driverStatsSchema = new Schema<IDriverStats>(
  {
    totalRides: { type: Number, default: 0 },
    completedRides: { type: Number, default: 0 },
    cancelledRides: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    onlineHours: { type: Number, default: 0 },
  },
  { _id: false, versionKey: false }
);

const driverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    onlineStatus: {
      type: String,
      enum: Object.values(OnlineStatus),
      default: OnlineStatus.OFFLINE,
    },
    currentLocation: currentLocationSchema,
    currentRiderId: { type: Schema.Types.ObjectId, ref: "Ride" },
    earnings: [driverEarningSchema],
    stats: { type: driverStatsSchema, default: () => ({}) },
    lastOnlineAt: { type: Date },
    lastOfflineAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const Driver = model<IDriver>("Driver", driverSchema);
