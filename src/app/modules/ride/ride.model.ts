import { model, Schema } from "mongoose";
import { ILocation, IRide, IStatusHistory, RideStatus } from "./ride.interface";

const locationSchema = new Schema<ILocation>({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, enum: Object.values(RideStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false, versionKey: false }
);

const rideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: locationSchema, required: true },
    destinationLocation: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    statusHistory: [statusHistorySchema],
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    inTransitAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancellationReason: { type: String },
    fare: { type: Number },
    distance: { type: Number },
    duration: { type: Number },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const Ride = model<IRide>("Ride", rideSchema);
