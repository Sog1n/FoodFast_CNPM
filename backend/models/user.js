const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false, // Không trả về password trong query
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: function (val) {
      return val === this.password;
    },
    message: "Passwords are not the same!",
  },
  avatar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  role: {
    type: String,
    enum: ["user", "admin", "restaurant-owner"],
    default: "user",
  },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  passwordChangedAt: Date,
  active: { type: Boolean, default: true, select: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// 🔑 Trước khi lưu user → hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// 📌 Check password đúng sai
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 📌 Check password có bị đổi sau khi JWT được cấp không
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// 📌 Tạo token reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
