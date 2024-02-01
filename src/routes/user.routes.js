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
} from "../controllers/user.controllers.js";
import {
  authenticate,
  isTeacher,
  isStudent,
} from "../middlewares/auth.middlewares.js";

const userRoutes = express.Router();

userRoutes.post("/sendOTP", sendOTPController);
userRoutes.post("/signUp", signupController);
userRoutes.post("/logIn", loginController);
userRoutes.post("/changePassword", authenticate, changePasswordController);
userRoutes.post("/logoutUser", authenticate, logoutUserContoller);

userRoutes.route("/forgotPassword").post(forgotPasswordController);
userRoutes.route("/forgotPassword/:resetToken").put(resetPasswordController);
userRoutes.route("/forgotPassword/:resetToken").get(forgotPasswordTokenLink);

userRoutes.get("/student", authenticate ,isStudent, (req, res)=>{
  res.send("This is Protected Routes for studend")
})
export default userRoutes;
