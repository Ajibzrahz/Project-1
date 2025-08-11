import { StatusCodes } from "http-status-codes";
import { notFoundError, unauthenticatedError } from "../errors/index.js";
import orderModel from "../models/order.js";
import productModel from "../models/product.js";
import cartModel from "../models/cart.js";

const createOrder = async (req, res, next) => {
  const payload = req.body;
  const { id } = req.user;

  if (!id) {
    const err = new unauthenticatedError("Login!!");
    next(err);
  }
  try {
    const cart = await cartModel
      .findOne({ user: id })
      .populate("items.product");
    if (!cart) {
      const err = new notFoundError("cart not found");
      return next(err);
    }

    const orderItems = cart.items.map((items) => ({
      product: items.product._id,
      quantity: items.quantity,
      orderPrice: items.product.price,
    }));

    const totalPrice = orderItems.reduce((sum, item) => {
      return sum + item.orderPrice * item.quantity;
    }, 0);

    const create_Order = new orderModel({
      ...payload,
      user: id,
      items: orderItems,
      totalAmount: totalPrice,
    });
    const savedOrder = await create_Order.save();

    res
      .status(StatusCodes.CREATED)
      .json({ msg: "Order Placed", order: savedOrder });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  const { id } = req.user;

  if (!id) {
    const err = new unauthenticatedError("Login!!");
    next(err);
  }
  try {
    const order = await orderModel
      .findOne({ user: id })
      .select("-_id -__v, -createdAt -updatedAt -items._id");
    if (!order) {
      const err = new notFoundError("order not found");
      return next(err);
    }
    res.status(StatusCodes.ACCEPTED).json(order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  const { id } = req.user;
  const { orderId } = req.query;

  if (!id) {
    const err = new unauthenticatedError("Login!!");
    return next(err);
  }
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      const err = new notFoundError("order not found");
      next(err);
    }

    await orderModel.findByIdAndDelete(orderId);
    res.status(StatusCodes.ACCEPTED).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};
const updateOrder = async (req, res, next) => {
  const { role } = req.user;
  const { status } = req.body;
  const { orderId } = req.query;

  if (role !== "admin") {
    const err = new unauthenticatedError("Only admin can update");
    return next(err);
  }
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      const err = new notFoundError("order not found");
      next(err);
    }

    const updateStatus = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status: status,
      },
      { new: true }
    );
    res.status(StatusCodes.ACCEPTED).json({ msg: "update", updateStatus });
  } catch (error) {
    next(error);
  }
};
export { createOrder, getOrder, cancelOrder, updateOrder };
