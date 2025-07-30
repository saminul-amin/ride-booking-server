import { Types } from "mongoose";

export enum Role {
  ADMIN = "admin",
  RIDER = "rider",
  DRIVER = "driver",
}

export enum UserStatus {
  ACTIVE = "active",
  BLOCKED = "blocked",
}

export enum DriverStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
}

export interface IVehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  status: UserStatus;
  driverStatus?: DriverStatus;
  isOnline?: boolean;
  vehicleInfo?: IVehicleInfo;
  earnings: number;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}
