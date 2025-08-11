import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrder,
  updateOrder,
} from "../controllers/order-controller.js";
const orderRouter = express.Router();

orderRouter
  .route("/")
  .post(createOrder)
  .get(getOrder)
  .delete(cancelOrder)
  .put(updateOrder);

export default orderRouter;
