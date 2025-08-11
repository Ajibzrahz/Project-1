import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    address: {
      type: String,
      minLength: 3,
      maxLength: 255,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contact: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profilePics: {
      type: String,
    },
  },
  { timestamps: true }
);

//Hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const hashPassword = bcrypt.hashSync(this.password, 10);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

//generating token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
