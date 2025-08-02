import z from "zod";
import { RideStatus } from "./ride.interface";

const locationSchema = z.object({
  address: z
    .string({ message: "Address must be a string" })
    .min(5, { message: "Address must be at least 5 characters long" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .trim(),
  latitude: z
    .number({ message: "Latitude must be a number" })
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" }),
  longitude: z
    .number({ message: "Longitude must be a number" })
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" }),
});

export const createRideZodSchema = z
  .object({
    pickupLocation: locationSchema,
    destinationLocation: locationSchema,
  })
  .refine(
    (data) => {
      const pickupLat = data.pickupLocation.latitude;
      const pickupLng = data.pickupLocation.longitude;
      const destLat = data.destinationLocation.latitude;
      const destLng = data.destinationLocation.longitude;

      const latDiff = Math.abs(pickupLat - destLat);
      const lngDiff = Math.abs(pickupLng - destLng);

      return latDiff > 0.001 || lngDiff > 0.001;
    },
    {
      message: "Pickup and destination locations must be different",
    }
  );

export const updateRideStatusZodSchema = z.object({
  status: z.nativeEnum(RideStatus, {
    message:
      "Status must be one of: requested, accepted, picked_up, in_transit, completed, cancelled",
  }),
});

export const rateRideZodSchema = z.object({
  rating: z
    .number({ message: "Rating must be a number" })
    .int({ message: "Rating must be an integer" })
    .min(1, { message: "Rating must be between 1 and 5" })
    .max(5, { message: "Rating must be between 1 and 5" }),
  feedback: z
    .string({ message: "Feedback must be a string" })
    .max(1000, { message: "Feedback cannot exceed 1000 characters" })
    .trim()
    .optional(),
});
