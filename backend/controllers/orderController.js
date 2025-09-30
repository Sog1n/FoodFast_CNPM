const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const { ObjectId } = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// @desc    Create new order
// @route   POST /api/v1/orders
exports.newOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            deliveryInfo,
            itemsPrice,
            taxPrice,
            deliveryCharge,
            finalTotal,
            paymentInfo,
        } = req.body;

        const order = await Order.create({
            orderItems,
            deliveryInfo,
            itemsPrice,
            taxPrice,
            deliveryCharge,
            finalTotal,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user.id,          // Lấy từ middleware auth
            restaurant: req.body.restaurant, // Gắn restaurant vào order
        });

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.error("Error in newOrder:", err);
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
}

// exports.newOrder = catchAsyncErrors(async (req, res, next) => {
//     const {
//         orderItems,
//         deliveryInfo,
//         itemsPrice,
//         taxPrice,
//         deliveryCharge,
//         finalTotal,
//         paymentInfo,
//     } = req.body;
//
//     const order = await Order.create({
//         orderItems,
//         deliveryInfo,
//         itemsPrice,
//         taxPrice,
//         deliveryCharge,
//         finalTotal,
//         paymentInfo,
//         paidAt: Date.now(),
//         user: req.user.id,          // Lấy từ middleware auth
//         restaurant: req.restaurant.id, // Gắn restaurant vào order
//     });
//
//     res.status(200).json({
//         success: true,
//         order,
//     });
// });

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("restaurant")
        .exec();

    if (!order) {
        return next(new ErrorHandler("No Order found with this ID", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/myOrders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const userId = new ObjectId(req.user.id);

    const orders = await Order.find({ user: userId })
        .populate("user", "name email")
        .populate("restaurant")
        .exec();

    res.status(200).json({
        success: true,
        orders,
    });
});

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.finalTotal;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});
