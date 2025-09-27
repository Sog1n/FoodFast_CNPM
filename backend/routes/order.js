const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders
} = require("../controllers/orderController");

const authController = require("../controllers/authController");

// Create new order (protected route)
router.route("/new")
    .post(authController.protect, newOrder);

// Get single order by ID (protected route)
router.route("/:id")
    .get(authController.protect, getSingleOrder);

// Get orders of the logged-in user (protected route)
router.route("/me/myOrders")
    .get(authController.protect, myOrders);

module.exports = router;
