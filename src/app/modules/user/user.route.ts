import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Roles } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);
// router.get("/all-users", checkAuth(Roles.ADMIN), UserControllers.getAllUsers);
router.get("/all-users", checkAuth(...Object.values(Roles)), UserControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Roles)), UserControllers.getMe);
router.get("/:id", checkAuth(Roles.ADMIN), UserControllers.getSingleUser);

export const UserRoutes = router;
