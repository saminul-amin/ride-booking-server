import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Roles } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createDriverProfileZodSchema,
  driverEarningsZodSchema,
  driverStatsZodSchema,
  setOnlineStatusZodSchema,
  updateLocationZodSchema,
} from "./driver.validation";

const router = Router();

router.post(
  "/profile",
  checkAuth(Roles.DRIVER),
  validateRequest(createDriverProfileZodSchema),
  DriverControllers.createDriverProfile
);
router.get(
  "/profile",
  checkAuth(Roles.DRIVER),
  DriverControllers.getDriverProfile
);
router.patch(
  "/status",
  checkAuth(Roles.DRIVER),
  validateRequest(setOnlineStatusZodSchema),
  DriverControllers.setOnlineStatus
);
router.patch(
  "/location",
  checkAuth(Roles.DRIVER),
  validateRequest(updateLocationZodSchema),
  DriverControllers.updateLocation
);
router.get(
  "/dashboard",
  checkAuth(Roles.DRIVER),
  DriverControllers.getDriverDashboard
);
router.get(
  "/earnings",
  checkAuth(Roles.DRIVER),
  validateRequest(driverEarningsZodSchema),
  DriverControllers.getDriverEarnings
);
router.get("/stats", checkAuth(Roles.DRIVER), DriverControllers.getDriverStats);
router.get(
  "/online",
  checkAuth(Roles.ADMIN),
  DriverControllers.getOnlineDrivers
);
router.get(
  "/all-drivers",
  checkAuth(Roles.ADMIN),
  DriverControllers.getAllDrivers
);
router.post(
  "/:id/earnings",
  checkAuth(Roles.ADMIN),
  DriverControllers.addDriverEarning
);
router.patch(
  "/:id/stats",
  checkAuth(Roles.ADMIN),
  validateRequest(driverStatsZodSchema),
  DriverControllers.updateDriverStats
);
router.delete(
  "/:id",
  checkAuth(Roles.ADMIN),
  DriverControllers.deleteDriverProfile
);

export const DriverRoutes = router;
