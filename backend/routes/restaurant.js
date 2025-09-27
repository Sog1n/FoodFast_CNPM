const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const menuRoutes = require("./menu");
const reviewRoutes = require("./reviewsRoutes");

// Lấy tất cả nhà hàng hoặc tạo nhà hàng mới
router
    .route("/")
    .get(getAllRestaurants)
    .post(createRestaurant);

// Lấy chi tiết hoặc xóa một nhà hàng theo storeId
router
    .route("/:storeId")
    .get(getRestaurant)
    .delete(deleteRestaurant);

// Nested routes cho menu và reviews
router.use("/:storeId/menus", menuRoutes);
router.use("/:storeId/reviews", reviewRoutes);

module.exports = router;
