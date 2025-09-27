const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

// Quên mật khẩu
router.post("/forgetPassword", authController.forgotPassword);

// Reset mật khẩu bằng token
router.put("/resetPassword/:token", authController.resetPassword);

// Đăng xuất
router.route("/logout").get(authController.logout);

// Lấy thông tin user hiện tại
router.route("/me").get(
    authController.protect,
    authController.getUserProfile
);

// Cập nhật thông tin cá nhân
router.route("/me/update").put(
    authController.protect,
    authController.updateProfile
);

// Đổi mật khẩu
router.route("/password/update").patch(
    authController.protect,
    authController.updatePassword
);

module.exports = router;
