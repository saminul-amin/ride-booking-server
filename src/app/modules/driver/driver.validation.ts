import z from "zod";
import { EarningType, OnlineStatus } from "./driver.interface";

const locationSchema = z.object({
  latitude: z
    .number({ message: "Latitude must be a number" })
    .min(-90, { message: "Latitude must be between -90 and 90 degrees" })
    .max(90, { message: "Latitude must be between -90 and 90 degrees" }),
  longitude: z
    .number({ message: "Longitude must be a number" })
    .min(-180, { message: "Longitude must be between -180 and 180 degrees" })
    .max(180, { message: "Longitude must be between -180 and 180 degrees" }),
  address: z
    .string({ message: "Address must be a string" })
    .min(5, { message: "Address must be at least 5 characters long" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .trim()
    .optional(),
});

export const setOnlineStatusZodSchema = z
  .object({
    status: z.nativeEnum(OnlineStatus, {
      message: "Status must be either 'online' or 'offline'",
    }),
    location: locationSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.status === OnlineStatus.ONLINE && !data.location) {
        return false;
      }
      return true;
    },
    {
      message: "Location is required when setting status to online",
      path: ["location"],
    }
  );

export const updateLocationZodSchema = locationSchema.required({
  latitude: true,
  longitude: true,
});

export const driverEarningsZodSchema = z.object({
  riderId: z
    .string({ message: "Rider ID must be a string" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid rider ID format" })
    .optional(),
  type: z.nativeEnum(EarningType, {
    message: "Type must be ride_completion, bonus, penalty, or adjustment",
  }),
  amount: z
    .number({ message: "Amount must be a number" })
    .min(0, { message: "Amount cannot be negative" })
    .max(100000, { message: "Amount cannot exceed 100,000" }),
  description: z
    .string({ message: "Description must be a string" })
    .min(3, { message: "Description must be at least 3 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" })
    .trim(),
  date: z
    .string({ message: "Date must be a string" })
    .datetime({ message: "Invalid date format. Use ISO 8601 format" })
    .optional()
    .transform((date) => (date ? new Date(date) : new Date())),
});

export const driverStatsZodSchema = z
  .object({
    totalRides: z
      .number({ message: "Total rides must be a number" })
      .int({ message: "Total rides must be an integer" })
      .min(0, { message: "Total rides cannot be negative" })
      .optional(),
    completedRides: z
      .number({ message: "Completed rides must be a number" })
      .int({ message: "Completed rides must be an integer" })
      .min(0, { message: "Completed rides cannot be negative" })
      .optional(),
    cancelledRides: z
      .number({ message: "Cancelled rides must be a number" })
      .int({ message: "Cancelled rides must be an integer" })
      .min(0, { message: "Cancelled rides cannot be negative" })
      .optional(),
    totalEarnings: z
      .number({ message: "Total earnings must be a number" })
      .min(0, { message: "Total earnings cannot be negative" })
      .optional(),
    averageRating: z
      .number({ message: "Average rating must be a number" })
      .min(0, { message: "Average rating cannot be less than 0" })
      .max(5, { message: "Average rating cannot exceed 5" })
      .optional(),
    onlineHours: z
      .number({ message: "Online hours must be a number" })
      .min(0, { message: "Online hours cannot be negative" })
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.totalRides !== undefined &&
        data.completedRides !== undefined &&
        data.cancelledRides !== undefined
      ) {
        return data.completedRides + data.cancelledRides <= data.totalRides;
      }
      return true;
    },
    {
      message: "Completed rides + cancelled rides cannot exceed total rides",
      path: ["totalRides"],
    }
  );

export const createDriverProfileZodSchema = z.object({
  userId: z
    .string({ message: "User ID must be a string" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid user ID format" }),
  currentLocation: locationSchema.optional(),
});
