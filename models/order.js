import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      orderPrice: {
        type: Number,
      },
    },
  ],
    payment: {
      type: String,
      enum: ["Transfer", "Cash", "Card"],
      default: "Cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
