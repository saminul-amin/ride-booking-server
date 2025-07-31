import z from "zod";
import { Roles } from "./user.interface";

// Create user validation schema
export const createUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .trim(),
  email: z
    .string({ message: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .toLowerCase(),
  password: z
    .string({ message: "Password must be string" })
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
  phone: z
    .string({ message: "Phone number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  role: z.nativeEnum(Roles, {
    message: "Role must be admin, rider, or driver",
  }),
});
