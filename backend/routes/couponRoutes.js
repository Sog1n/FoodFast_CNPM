const express = require("express");
const {
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  couponValidate,
} = require("../controllers/couponController");

const router = express.Router();

// Tạo coupon mới + lấy danh sách coupon
router.route("/")
    .post(createCoupon)
    .get(getCoupon);

// Cập nhật hoặc xóa coupon theo ID
router.route("/:couponId")
    .patch(updateCoupon)
    .delete(deleteCoupon);

// Validate coupon (kiểm tra có hợp lệ không)
router.route("/validate")
    .post(couponValidate);

module.exports = router;
