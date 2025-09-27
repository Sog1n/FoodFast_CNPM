const Fooditem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// @desc    Get all food items
// @route   GET /api/v1/fooditems
exports.getAllFoodItems = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.storeId) {
        filter = { restaurant: req.params.storeId };
    }

    const foodItems = await Fooditem.find(filter);

    res.status(200).json({
        status: "success",
        results: foodItems.length,
        data: foodItems,
    });
});

// @desc    Create new food item
// @route   POST /api/v1/fooditems
exports.createFoodItem = catchAsync(async (req, res, next) => {
    const newFoodItem = await Fooditem.create(req.body);

    res.status(201).json({
        status: "success",
        data: newFoodItem,
    });
});

// @desc    Get a food item by ID
// @route   GET /api/v1/fooditems/:foodId
exports.getFoodItem = catchAsync(async (req, res, next) => {
    const foodItem = await Fooditem.findById(req.params.foodId);

    if (!foodItem) {
        return next(new ErrorHandler("No foodItem found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: foodItem,
    });
});

// @desc    Update a food item
// @route   PUT /api/v1/fooditems/:foodId
exports.updateFoodItem = catchAsync(async (req, res, next) => {
    const updatedFoodItem = await Fooditem.findByIdAndUpdate(
        req.params.foodId,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedFoodItem) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: updatedFoodItem,
    });
});

// @desc    Delete a food item
// @route   DELETE /api/v1/fooditems/:foodId
exports.deleteFoodItem = catchAsync(async (req, res, next) => {
    const deletedFoodItem = await Fooditem.findByIdAndDelete(req.params.foodId);

    if (!deletedFoodItem) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
    });
});
