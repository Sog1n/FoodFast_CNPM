const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  setUserRestaurantIds,
  createReviews,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authController = require("../controllers/authController");

// Middleware: mọi route đều cần đăng nhập
router.use(authController.protect);

// / → GET tất cả review, POST tạo review
router
    .route("/")
    .get(getAllReviews)
    .post(setUserRestaurantIds, createReviews);

// /:reviewId → GET 1 review, PATCH update, DELETE xóa
router
    .route("/:reviewId")
    .get(getReview)
    .patch(updateReview)
    .delete(deleteReview);

module.exports = router;
