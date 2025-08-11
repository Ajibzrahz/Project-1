import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cart-controller.js";
const cartRouter = express.Router();

cartRouter.route("/").put(addToCart).get(getCart);
cartRouter.route("/remove").put(removeFromCart);

export default cartRouter;
