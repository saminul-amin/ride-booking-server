import { Types } from "mongoose";

export enum OnlineStatus {
  ONLINE = "online",
  OFFLINE = "offline",
}

export enum EarningType {
  RIDE_COMPLETION = "ride_completion",
  BONUS = "bonus",
  PENALTY = "penalty",
  ADJUSTMENT = "adjustment",
}

export interface IDriverEarnings {
  riderId?: Types.ObjectId;
  type: EarningType;
  amount: number;
  description: string;
  date: Date;
}

export interface IDriverStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  averageRating: number;
  onlineHours: number;
}

export interface IDriver {
  userId: Types.ObjectId;
  onlineStatus: OnlineStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  currentRiderId?: Types.ObjectId;
  earnings: IDriverEarnings[];
  stats: IDriverStats;
  lastOnlineAt?: Date;
  lastOfflineAt?: Date;
}

export interface ISetOnlineStatusRequest {
  status: OnlineStatus;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface IUpdateLocationRequest {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IDriverDashboardResponse {
  driver: IDriver;
  activeRide?: any;
  pendingRides: any[];
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
}
