import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Roles } from "../user/user.interface";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(Roles)),
  AuthControllers.changePassword
);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Roles)),
  AuthControllers.resetPassword
);

export const AuthRoutes = router;
