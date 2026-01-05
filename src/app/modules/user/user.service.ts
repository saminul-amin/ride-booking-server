import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const user = await User.create({
    email,
    password: hashedPassword,
    ...rest,
  });
  return user;
};

const getAllUsers = async (query: any) => {
  const { page = 1, limit = 10, searchTerm, role, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};

  if (role) filter.role = role;
  if (status) filter.status = status;

  if (searchTerm) {
      filter.$or = [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { phone: { $regex: searchTerm, $options: "i" } }
      ];
  }

  const users = await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return {
      users,
      meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPage: Math.ceil(total / Number(limit))
      }
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }
  return {
    data: user,
  };
};

const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
  }).select("-password");

  return {
    data: updatedUser,
  };
};

const updateUserStatus = async (userId: string, status: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password");
    return updatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateProfile,
  updateUserStatus
};
