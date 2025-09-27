const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: "./config/config.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// @desc    Process payment (create payment intent)
// @route   POST /api/v1/payment/process
exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount, // số tiền (tính bằng cent)
        currency: "inr", // đồng tiền (ở đây là Rupee của Ấn Độ)
        metadata: { integration_check: "accept_a_payment" },
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
    });
});

// @desc    Send Stripe API Key to frontend
// @route   GET /api/v1/stripeapikey
exports.sendStripApi = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY,
    });
});
