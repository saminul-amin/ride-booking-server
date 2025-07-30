import { Types } from "mongoose";

export enum RideStatus {
  REQUESTED = "requested",
  ACCEPTED = "accepted",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface ILocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface IStatusHistory {
  status: RideStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId;
}

export interface IRide {
  _id?: Types.ObjectId;
  riderId: Types.ObjectId;
  driverId?: Types.ObjectId;
  pickupLocation: ILocation;
  destinationLocation: ILocation;
  status: RideStatus;
  statusHistory: IStatusHistory;
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  inTransitAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancellationReason?: string;
  fare?: number;
  distance?: number;
  duration?: number;
  rating?: number;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
