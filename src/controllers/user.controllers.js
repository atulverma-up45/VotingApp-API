import User from "../models/user.models.js";
import OTP from "../models/otp.models.js";
import ForgotPassword from "../models/forgotPassword.models.js";
import otpGenerator from "otp-generator";
import sendMail from "../utils/sendMail.js";
import otpMailTemplate from "../mail/templates/verifyOTP.mailTemplates.js";
import forgotPasswordTemplate from "../mail/templates/forgotPasswordToken.mailTemplates.js";
import changePasswordTemplate from "../mail/templates/changePassword.mailTemplates.js";
import resetPasswordTemplate from "../mail/templates/resetPassword.mailTemplates.js";
import crypto from "crypto";

// email validation function
function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// generate Access And Refresh Tokens

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error Generating Tokens:", error);
    throw new Error("Error generating tokens");
  }
};

// send email OTP verify controller
export const sendOTPController = async (req, res) => {
  try {
    const { firstName, email } = req.body;

    // validate the data
    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    // Generate unique OTP using otp generator
    const generatedOTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Delete existing OTP for the user
    await OTP.findOneAndDelete({ email: email });

    // Save generated OTP in the database
    const response = await OTP.create({
      email,
      otp: generatedOTP,
    });

    // Send generated OTP to the user's email for verification
    sendMail(
      email,
      `Email Verification Mail From VotingApp API.`,
      otpMailTemplate(firstName, generatedOTP)
    );

    return res.status(201).json({
      success: true,
      Data: response,
      message: "OTP Sent to the User Email Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in send otp controller",
    });
  }
};

// signup controllers
export const signupController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      gender,
      contactNumber,
    } = req.body;

    // console.log(
    //   "data",
    //   firstName,
    //   lastName,
    //   email,
    //   password,
    //   confirmPassword,
    //   otp,
    //   gender,
    //   contactNumber
    // );
    // Validate the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !gender ||
      !contactNumber ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required. Please fill them carefully.",
      });
    }

    // Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    // Validate the password and confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and ConfirmPassword do not match.",
      });
    }

    // Verify the user's OTP and the database OTP
    const dbOtp = await OTP.findOne({ email });

    // console.log("Database OTP:", dbOtp);

    if (!dbOtp) {
      return res.status(400).json({
        success: false,
        message:
          "Email With This OTP Is not found. Please Regenerate OTP Again.",
      });
    }

    if (!dbOtp || otp !== dbOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid OTP.",
      });
    }

    // Check if OTP is still valid (within 5 minutes)
    const now = new Date();
    const otpExpirationTime = new Date(
      dbOtp.createdAt.getTime() + 5 * 60 * 1000
    );

    if (now > otpExpirationTime) {
      return res.status(400).json({
        success: false,
        message: "The OTP has expired. Please request a new one.",
      });
    }

    // validate if the user is already registered
    const alreadyRegisteredUser = await User.findOne({ email: email });

    if (alreadyRegisteredUser) {
      return res.status(400).json({
        success: false,
        message: "User with this Email is Already Registered",
      });
    }

    // Create the user
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: confirmPassword,
      contactNumber,
      gender,
      otp: dbOtp._id,
      avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(201).json({
      success: true,
      message: "The user was successfully registered.",
      data: createdUser,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// loginController
export const loginController = async (req, res) => {
  try {
    // Fetch the data from the request body
    const { email, password } = req.body;

    // Validate the data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up first",
      });
    }

    // Compare and match the password
    const isCorrectPassword = await user.isPasswordCorrect(password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect. Please enter the correct password",
      });
    }

    // Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    // Get the logged-in user without sensitive information
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Set the JWT as a cookie and create options
    const options = {
      httpOnly: true,
      sameSite: "Strict",
      secure: true
    };

    // include the access token And Refresh token in the response headers
    res.setHeader('X-accessToken', accessToken);
    res.setHeader('X-refreshToken', refreshToken);

    // Send the response with cookies and user information
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        user: loggedInUser,
        message: "User logged in successfully",
      });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in loginController.",
    });
  }
};

// change Password controller
export const changePasswordController = async (req, res) => {
  try {
    // fetch the data
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // fetch the userEmail
    const email = req.user.email;

    // validate the data
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are Required",
      });
    }

    // Check the user details
    const user = await User.findOne({ email });

    // Compare and match the password
    const isCorrectPassword = await user.isPasswordCorrect(oldPassword); // Fix: use oldPassword instead of password

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Old Password is incorrect. Please enter the valid Old password",
      });
    }

    // check new password and confirmPassword matched or not
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password And Confirm Password is Not Matched",
      });
    }
    // Update the password in the user instance (not saved to the database yet)
    user.password = confirmPassword;

    // Save the updated user to the database
    await user.save();

    // Send Change Password Mail via email
    await sendMail(
      user.email,
      "Your Password Changed Successfully Mail From VotingApp API",
      changePasswordTemplate(user.firstName, confirmPassword)
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error in changePasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ForgotPassword controller
export const forgotPasswordController = async (req, res) => {
  try {
    // fetch the email from req body
    const { email } = req.body;

    // validate the data
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for forgetting the password",
      });
    }

    // Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email ID",
      });
    }

    // Find the existing user
    const existingUser = await User.findOne({ email });

    // Check if the user exists or not
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "The user with this email is not registered. Please sign up first.",
      });
    }

    // Delete existing "forgot password token" records for the user
    await ForgotPassword.findOneAndDelete({
      user: existingUser._id,
    });

    // Create a new ForgotPassword instance
    const forgotPasswordInstance = new ForgotPassword({
      user: existingUser._id,
    });

    // Get the reset token using the instance method
    const resetToken = forgotPasswordInstance.getResetToken();

    // Save the ForgotPassword document to the database
    await forgotPasswordInstance.save();

    const link = `${process.env.FORGOT_PASSWORD_FRONTEND_URL}/forgotPassword/${resetToken}`;

    // Send token via email
    await sendMail(
      existingUser.email,
      "Password Reset Request Mail From VotingApp API",
      forgotPasswordTemplate(existingUser.firstName, existingUser.email, link)
    );

   
    return res.status(200).json({
      success: true,
      message: `Password reset email sent successfully on your Email: ${email}.`,
    });
  } catch (error) {
    console.error(
      "Error occurred while processing forgot password request",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Error occurred while processing forgot password request",
    });
  }
};

export const forgotPasswordTokenLink = async (req, res)=>{
  res.render("./frontent/resetPassword.ejs");
}

// Reset Password Controller
export const resetPasswordController = async (req, res) => {
  try {
    // fetch the reset token from request parameters
    const { resetToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // console.log("resetToken:", resetToken, newPassword, confirmPassword);
    // validate the data
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password And Confirm password Filled Are Required",
      });
    }

    // match the newPassword and confirmPassword
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and Confirm Password Should be Same",
      });
    }

    // Hash the reset token for comparison
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find the forgot Password Reset Token from the database
    const forgotPasswordResetToken = await ForgotPassword.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: {
        $gt: Date.now(),
      },
    });

    // Validate the token
    if (!forgotPasswordResetToken || !forgotPasswordResetToken.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    // Find the user with the associated token
    const user = await User.findById(forgotPasswordResetToken.user);

    // Validate user existence
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found for the given reset token.",
      });
    }

    // Update user password
    user.password = confirmPassword;
    user.markModified("password");

    // Save the user changes
    await user.save();

    // Send Change Password Mail via email
    await sendMail(
      user.email,
      "Password Reset Successfully Mail From VotingApp API",
      resetPasswordTemplate(user.firstName, confirmPassword)
    );
    // Unset forgotPasswordToken and forgotPasswordExpiry
    forgotPasswordResetToken.forgotPasswordToken = undefined;
    forgotPasswordResetToken.forgotPasswordExpiry = undefined;

    // Save the changes
    await forgotPasswordResetToken.save();

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
      user: user, 
    });
  } catch (error) {
    console.error("Error Occur while Reseting the Password", error.message);
    return res.status(500).json({
      success: false,
      message: "The Password Does Not Reset, Please Try again Later",
    });
  }
};

// logout the user
export const logoutUserContoller = async (req, res) => {
  try {
    // Update user to clear tokens
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
          accessToken: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      // Handle the case where the user was not found
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully.",
      });
  } catch (error) {
    console.error("Error in logoutUserContoller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
