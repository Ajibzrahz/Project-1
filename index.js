import express from "express";
import connectDB from "./config/connect.js";
import dotenv from "./config/dotenv.js";
import cookieParser from "cookie-parser";
import notFound from "./middlewares/notfound.js";
import errorMiddleware from "./middlewares/error-handler.js";
import userRouter from "./routes/user-route.js";
import productRouter from "./routes/product-route.js";
import cartRouter from "./routes/cart-route.js";
import Authentication from "./middlewares/auth.js";
import categoryRouter from "./routes/category-route.js";
import orderRouter from "./routes/order-route.js";

const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", Authentication, cartRouter);
app.use("/api/v1/category", Authentication, categoryRouter);
app.use("/api/v1/order", Authentication, orderRouter);

const start = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`App is running on port: ${port}`);
    });
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

//error
app.use(errorMiddleware);
app.use(notFound);
start();
