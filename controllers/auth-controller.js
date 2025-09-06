import cloudinary from "../config/cloudinary.js";
import { customApiError, notFoundError } from "../errors/index.js";
import { StatusCodes } from "http-status-codes";
import userModel from "../models/user.js";
import cartModel from "../models/cart.js";
import fs from "fs/promises";
import bcrypt from "bcryptjs";

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

    const isFirstAccount = (await userModel.estimatedDocumentCount({})) === 0;
    const role = isFirstAccount ? "admin" : "user";

    const newUser = new userModel({
      ...payload,
      profilePics: result,
      email: payload.email.toLowerCase(),
      role: role,
    });
    const saveUser = await newUser.save();

    await cartModel.create({ user: saveUser._id });

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
      .cookie("userToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
      .status(StatusCodes.ACCEPTED)
      .json({ user: user.name, token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res
    .cookie("userToken", "logout", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(StatusCodes.ACCEPTED)
    .json({ msg: "user logged out" });
};
export { register, login, logout };
