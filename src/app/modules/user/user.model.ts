import { model, Schema } from "mongoose";
import {
  DriverStatus,
  IUser,
  IVehicleInfo,
  Roles,
  UserStatus,
} from "./user.interface";

const vehicleInforSchema = new Schema<IVehicleInfo>(
  {
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    licensePlate: { type: String },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(Roles) },
    status: { type: String, enum: Object.values(UserStatus) },
    driverStatus: {
      type: String,
      enum: Object.values(DriverStatus),
      default: function () {
        return (this as any).role === Roles.DRIVER
          ? DriverStatus.APPROVED
          : undefined;
      },
    },
    isOnline: {
      type: Boolean,
      default: function () {
        return (this as any).role === Roles.DRIVER ? false : undefined;
      },
    },
    vehicleInfo: vehicleInforSchema,
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>("User", userSchema);
