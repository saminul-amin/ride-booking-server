import z from "zod";
import { OnlineStatus } from "./driver.interface";

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

