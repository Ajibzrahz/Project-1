import { StatusCodes } from "http-status-codes";
import {
  customApiError,
  notFoundError,
  unauthenticatedError,
} from "../errors/index.js";
import categoryModel from "../models/category.js";

const addCategory = async (req, res, next) => {
  const payload = req.body;
  const { role } = req.user;

  if (role !== "admin") {
    const err = new unauthenticatedError("You cannot create a category");
    return next(err);
  }

  try {
    const isExisting = await categoryModel.findOne({
      name: payload.name.toUpperCase(),
    });
    if (isExisting) {
      const err = new customApiError("Category already exist😂");
      err.statusCode = StatusCodes.CONFLICT;
      return next(err);
    }

    const category = await categoryModel.create({
      ...payload,
      name: payload.name.toUpperCase(),
    });
    res.status(StatusCodes.CREATED).json(category);
  } catch (error) {
    next(error);
  }
};
const removeCategory = async (req, res, next) => {
  const { id } = req.query;
  const { role } = req.user;

  if (role !== "admin") {
    const err = new unauthenticatedError("You cannot create a category");
    return next(err);
  }

  try {
    const category = await categoryModel.findOne({ _id: id });
    if (!category) {
      const err = new notFoundError("category not found");
      return next(err);
    }

    await categoryModel.findOneAndDelete({ _id: id });
    res.status(StatusCodes.CREATED).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};
const getCategories = async (req, res, next) => {
  const { name } = req.query;
  try {
    const category = await categoryModel.aggregate([
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
          id: 0,
          description: 0,
        },
      },
    ]);
    res.status(StatusCodes.CREATED).json({ msg: category });
  } catch (error) {
    next(error);
  }
};
const updateCategory = async (req, res, next) => {
  const payload = req.body;
  const { id } = req.query;
  const { role } = req.user;

  if (role !== "admin") {
    const err = new unauthenticatedError("You cannot create a category");
    return next(err);
  }

  try {
    const category = await categoryModel.findOne({ _id: id });
    if (!category) {
      const err = new notFoundError("category not found");
      return next(err);
    }

    const update = await categoryModel.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });
    res.status(StatusCodes.CREATED).json({ update });
  } catch (error) {
    next(error);
  }
};

export { addCategory, removeCategory, getCategories, updateCategory };
