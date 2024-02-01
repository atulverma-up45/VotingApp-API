import mongoose from "mongoose";
import crypto from "crypto";

const forgotPasswordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  forgotPasswordExpiry: {
    type: Date,
  
  },
  forgotPasswordToken: {
    type: String,
  },
});

forgotPasswordSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(10).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("ForgotPassword", forgotPasswordSchema);
