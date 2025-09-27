const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getFoodItem,
  createFoodItem,
  getAllFoodItems,
  deleteFoodItem,
  updateFoodItem,
} = require("../controllers/foodItemController");

// POST /item → tạo FoodItem mới
router.route("/item").post(createFoodItem);

// GET /items/:storeId → lấy tất cả FoodItem của 1 store
router.route("/items/:storeId").get(getAllFoodItems);

// GET, PATCH, DELETE /item/:foodId → thao tác với 1 FoodItem
router
    .route("/item/:foodId")
    .get(getFoodItem)
    .patch(updateFoodItem)
    .delete(deleteFoodItem);

module.exports = router;
