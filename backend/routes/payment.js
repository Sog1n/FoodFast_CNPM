const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { processPayment, sendStripApi } = require("../controllers/paymentController");

// Route xử lý thanh toán
router
    .route("/process")
    .post(authController.protect, processPayment);

// Route lấy Stripe API key
router
    .route("/stripeapi")
    .get(authController.protect, sendStripApi);

module.exports = router;
