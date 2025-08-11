import express from "express";
import {
  addCategory,
  getCategories,
  removeCategory,
  updateCategory,
} from "../controllers/category-controller.js";
import Authentication from "../middlewares/auth.js";

import validateRequest from "../middlewares/validator.js";
import categoryValidate from "../validators/category-validate.js";

const categoryRouter = express.Router();

categoryRouter.route("/").get(getCategories);
categoryRouter
  .route("/")
  .post(Authentication, validateRequest(categoryValidate), addCategory)
  .put(Authentication, updateCategory)
  .delete(Authentication, removeCategory);

export default categoryRouter;
