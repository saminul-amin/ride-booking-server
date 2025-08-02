import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Roles } from "../user/user.interface";
import { RideControllers } from "./ride.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createRideZodSchema,
  rateRideZodSchema,
  updateRideStatusZodSchema,
} from "./ride.validation";

const router = Router();

router.post(
  "/request",
  checkAuth(Roles.RIDER),
  validateRequest(createRideZodSchema),
  RideControllers.requestRide
);
router.patch(
  "/:id/cancel",
  checkAuth(Roles.DRIVER, Roles.RIDER),
  RideControllers.cancelRide
);
router.post(
  "/:id/rate",
  checkAuth(Roles.RIDER),
  validateRequest(rateRideZodSchema),
  RideControllers.rateRide
);
router.patch(
  "/:id/accept",
  checkAuth(Roles.DRIVER),
  RideControllers.acceptRide
);
router.patch(
  "/:id/status",
  checkAuth(Roles.DRIVER),
  validateRequest(updateRideStatusZodSchema),
  RideControllers.updateRideStatus
);
router.get(
  "/available",
  checkAuth(Roles.DRIVER),
  RideControllers.getAvailableRides
);
router.get(
  "/history",
  checkAuth(Roles.RIDER, Roles.DRIVER),
  RideControllers.getRideHistory
);
router.get("/all-rides", checkAuth(Roles.ADMIN), RideControllers.getAllRides);
router.get(
  "/:id",
  checkAuth(Roles.ADMIN, Roles.DRIVER, Roles.RIDER),
  RideControllers.getSingleRide
);

export const RideRoutes = router;
