import { envVars } from "../config/env";
import { IUser, Roles, UserStatus } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await User.findOne({ email: envVars.ADMIN_EMAIL });

    if (isAdminExist) {
      console.log("Admin already exists");
      return;
    }

    console.log("Trying to create Admin!!");

    const hashedPassword = await bcryptjs.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const payload = {
      name: "Md. Saminul Amin (Admin)",
      role: Roles.ADMIN,
      email: envVars.ADMIN_EMAIL,
      password: hashedPassword,
      phone: "+8801326874247",
      status: UserStatus.ACTIVE,
      earnings: 0,
    } as IUser;

    const admin = await User.create(payload);
    console.log("Admin created successfully");
    console.log(admin);
  } catch (error) {
    console.log(error);
  }
};
