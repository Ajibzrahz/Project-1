import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.js";
import productModel from "../models/product.js";
import fs from "fs/promises";
import {
  badRequestError,
  notFoundError,
  unauthenticatedError,
} from "../errors/index.js";
import categoryModel from "../models/category.js";
import mongoose from "mongoose";

const createProduct = async (req, res, next) => {
  const { id, role } = req.user;
  const payload = req.body;
  const pictures = req.files;

  //Ensuring only Admin can create product
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this request");
    return next(err);
  }

  try {
    const checkCategory = await categoryModel.findById(payload.category);
    if (!checkCategory) {
      const err = new notFoundError("category not found");
      return next(err);
    }
    //uploading images to cloudinary
    const uploadedImages = [];

    for (const image of pictures) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      uploadedImages.push(result.secure_url);

      await fs.unlink(image.path);
    }
    //Making sure the images is not empty
    if (uploadedImages.length === 0) {
      const err = new badRequestError("At least one image required");
      return next(err);
    }

    //creating product
    const product = new productModel({
      ...payload,
      seller: id,
      images: uploadedImages,
    });
    const savedProduct = await product.save();

    return res.status(StatusCodes.CREATED).json({
      msg: "created",
      product: { product: savedProduct },
    });
  } catch (error) {
    if (error.http_code === 400) {
      const err = new badRequestError("must be an image");
      return next(err);
    }
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  const { name } = req.query;

  try {
    const product = await productModel.aggregate([
      {
        $match: {
          name: {
            $regex: name,
            $options: "i",
          },
        },
      },
      {
        $project: {
          name: 1,
          brand: 1,
          images: 1,
          _id: 0,
          price: 1,
          inventory: 1,
        },
      },
      {
        $sort: { name: 1, price: 1 },
      },
      { $limit: 5 },
    ]);

    if (!product) {
      const err = new notFoundError("Product does not exist");
      return next(err);
    }

    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};
const getSingleProduct = async (req, res, next) => {
  const { id } = req.query;

  try {
    const product = await productModel
      .findById(id)
      .select("-_id -updatedAt -__v")
      .populate("category", "name -_id");
    if (!product) {
      const err = new notFoundError("Product does not exist");
      return next(err);
    }

    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};
const deleteProduct = async (req, res, next) => {
  const { role } = req.user;
  const { id } = req.query;

  //Ensuring only Admin can create product
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this request");
    return next(err);
  }

  try {
    //creating product
    const product = await productModel.findById(id);
    if (!product && !mongoose.Types.ObjectId.isValid(product)) {
      const err = new notFoundError("Product not found");
      return next(err);
    }

    await productModel.findByIdAndDelete(id);

    return res.status(StatusCodes.OK).json({
      msg: "deleted",
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { role } = req.user;
  const payload = req.body;
  const { id } = req.query;
  const pictures = req.files || [];

  //Ensuring only Admin can update product
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this request");
    return next(err);
  }

  try {
    //uploading images to cloudinary
    const uploadedImages = [];

    for (const image of pictures) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      uploadedImages.push(result.secure_url);

      await fs.unlink(image.path);
    }

    //updating product
    const product = await productModel.findById(id);
    if (!product && !mongoose.Types.ObjectId.isValid(product)) {
      const err = new notFoundError("Product not found");
      return next(err);
    }
    const updatedImages = [...product.images, ...uploadedImages];
    if (updatedImages.length > 15) {
      const err = new badRequestError("You cannot upload more than 15 images");
      return next(err);
    }

    const updated = await productModel.findByIdAndUpdate(
      id,
      { ...payload, images: updatedImages },
      { new: true }
    );
    return res.status(StatusCodes.CREATED).json({
      msg: "updated",
      product: { product: updated },
    });
  } catch (error) {
    if (error.http_code === 400) {
      const err = new badRequestError("must be an image");
      return next(err);
    }
    next(error);
  }
};
export {
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
};
