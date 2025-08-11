import mongoose from "mongoose";
import cartModel from "../models/cart.js";
import productModel from "../models/product.js";
import { notFoundError, unauthenticatedError } from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { id } = req.user;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new notFoundError("product not found");
      return next(err);
    }

    const findCart = await cartModel.findOne({ user: id });
    if (!findCart) {
      const err = new notFoundError("cart not found, login");
      return next(err);
    }

    const updateCart = await cartModel.findOneAndUpdate(
      { user: id, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (updateCart) {
      return res
        .status(StatusCodes.ACCEPTED)
        .json({ msg: "Product Added to Cart", cart: updateCart });
    }

    const newCartItem = await cartModel.findOneAndUpdate(
      { user: id },
      { $push: { items: { product: productId, quantity } } },
      { new: true }
    );

    return res
      .status(StatusCodes.ACCEPTED)
      .json({ msg: "Product Added to Cart", cart: newCartItem });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  const { productId } = req.body;
  const { id } = req.user;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new notFoundError("product not found");
      return next(err);
    }

    const updateCart = await cartModel.findOne({
      user: id,
      "items.product": productId,
    });
    if (!updateCart) {
      const err = new notFoundError("Item not found");
      return next(err);
    }

    const removeItem = await cartModel.findOneAndUpdate(
      { user: id },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    return res
      .status(StatusCodes.ACCEPTED)
      .json({ msg: "Product removed from Cart", cart: removeItem });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  const { id } = req.user;

  try {
    const find_cart = await cartModel
      .findOne({ user: id })
      .populate("items.product", "name price images");

    if (!find_cart) {
      const err = new notFoundError("cart not found, Login!!");
      return next(err);
    }

    return res.status(StatusCodes.OK).json({ cart: find_cart });
  } catch (error) {
    next(error);
  }
};

export { addToCart, removeFromCart, getCart };
