import { StatusCodes } from "http-status-codes";
import userModel from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import {
  customApiError,
  badRequestError,
  notFoundError,
  unauthenticatedError,
} from "../errors/index.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import cartModel from "../models/cart.js";

// Registering a user
const register = async (req, res, next) => {
  const payload = req.body;
  const image = req.file?.path;

  try {
    const isExisting = await userModel.findOne({ email: payload.email });
    if (isExisting) {
      const err = new customApiError("Email already exist");
      err.statusCode = StatusCodes.CONFLICT;
      return next(err);
    }
    let result = null;

    if (image) {
      const uploading = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      result = uploading.secure_url;
      await fs.unlink(image);
    }

    const newUser = new userModel({
      ...payload,
      profilePics: result,
      email: payload.email.toLowerCase(),
    });
    const saveUser = await newUser.save();

    await cartModel.create({user: saveUser._id})

    const token = saveUser.generateToken();

    return res
      .status(StatusCodes.OK)
      .cookie("userToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
      .json({
        user: { name: saveUser.name, image: saveUser.profilePics, token },
      });
  } catch (error) {
    next(error);
  }
};

//User Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new notFoundError("Email not found");
      return next(err);
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      const err = new notFoundError("Incorrect email or password");
      return next(err);
    }

    const token = user.generateToken();

    res
      .status(StatusCodes.ACCEPTED)
      .cookie("userToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
      .json({ user: user.name, token });
  } catch (error) {
    next(error);
  }
};

//Admin getting all users
const allUsers = async (req, res, next) => {
  const { role } = req.user;
  console.log(role);
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this");
    next(err);
  }
  try {
    const users = await userModel.aggregate([
      {
        $match: {
          role: "user",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          _id: 0,
          profilePics: 1,
          address: 1,
        },
      },
      {
        $sort: { address: 1, name: 1 },
      },
      { $limit: 20 },
    ]);
    return res.status(StatusCodes.OK).json({ user: users });
  } catch (error) {
    next(error);
  }
};

//Admin getting a single user
const getUser = async (req, res, next) => {
  const { userId } = req.query;
  const { role } = req.user;
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this");
    return next(err);
  }

  try {
    const user = await userModel.findById(userId).select("-password");

    if (!user && !mongoose.Types.ObjectId.isValid(user)) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    return res.status(StatusCodes.OK).json({ user: user });
  } catch (error) {
    next(error);
  }
};

//Admin deleting a user
const deleteUser = async (req, res, next) => {
  const { userId } = req.query;
  const { role } = req.user;
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this");
    return next(err);
  }

  try {
    const user = await userModel.findById(userId);

    if (!user && !mongoose.Types.ObjectId.isValid(user)) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    await userModel.findByIdAndDelete(user);

    return res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};

//Logged in user getting profile
const getProfile = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }
    if (id != user._id) {
      const err = new unauthenticatedError("Not authorized, Login!!!");
      return next(err);
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

//Logged in user deleting profile
const deleteProfile = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }
    await userModel.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};

//Logged in user updating profile
const updateProfile = async (req, res, next) => {
  const { id } = req.user;
  const payload = req.body;
  const image = req.file?.path;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    let result = null;
    if (image) {
      const uploading = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      result = uploading.secure_url;
      fs.unlink(image);
    }
    const updated = await userModel
      .findByIdAndUpdate(
        id,
        { ...payload, profilePics: result, role: user.role },
        { new: true }
      )
      .select("name address");
    res
      .status(StatusCodes.CREATED)
      .json({ msg: updated, image: updated.profilePics });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  allUsers,
  getProfile,
  deleteProfile,
  updateProfile,
  getUser,
  deleteUser,
};
