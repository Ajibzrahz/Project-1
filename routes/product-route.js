import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
} from "../controllers/product-controller.js";
import validateRequest from "../middlewares/validator.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../validators/product-validate.js";
import { productImages } from "../middlewares/multer.js";
import Authentication from "../middlewares/auth.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .post(
    Authentication,
    productImages,
    validateRequest(createProductValidation),
    createProduct
  )
  .put(
    Authentication,
    productImages,
    validateRequest(updateProductValidation),
    updateProduct
  );

productRouter.route("/").get(getProduct).delete(Authentication, deleteProduct);
productRouter.route('/single').get(getSingleProduct)
export default productRouter;
