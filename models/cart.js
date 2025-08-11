import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
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

      createdAT: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
