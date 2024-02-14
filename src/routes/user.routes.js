import express from "express";
import {
  signupController,
  loginController,
  sendOTPController,
  changePasswordController,
  logoutUserContoller,
  forgotPasswordController,
  resetPasswordController,
  forgotPasswordTokenLink,
  userDetailsController,
} from "../controllers/user.controllers.js";
import {
  authenticate,
  isAdmin,
  isUser,
} from "../middlewares/auth.middlewares.js";

const userRoutes = express.Router();

userRoutes.post("/send-OTP", sendOTPController);
userRoutes.post("/signUp", signupController);
userRoutes.post("/logIn", loginController);
userRoutes.post("/change-Password", authenticate, changePasswordController);
userRoutes.post("/logout-User", authenticate, logoutUserContoller);

userRoutes.route("/forgot-Password").post(forgotPasswordController);
userRoutes.route("/forgot-Password/:resetToken").put(resetPasswordController);
userRoutes.route("/forgot-Password/:resetToken").get(forgotPasswordTokenLink);

userRoutes.route("/user").get(authenticate, userDetailsController);

userRoutes.get("/student", authenticate, isUser, (req, res) => {
  res.send("This is Protected Routes for studend");
});
export default userRoutes;
