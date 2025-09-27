const Restaurant = require("../models/restaurant");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// @desc    Get all restaurants (with search & sort features)
// @route   GET /api/v1/restaurants
exports.getAllRestaurants = catchAsync(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Restaurant.find(), req.query)
        .search()
        .sort();

    const restaurants = await apiFeatures.query;

    res.status(200).json({
        status: "success",
        count: restaurants.length,
        restaurants,
    });
});

// @desc    Create a restaurant
// @route   POST /api/v1/restaurants
exports.createRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
        status: "success",
        data: restaurant,
    });
});

// @desc    Get a single restaurant by ID
// @route   GET /api/v1/restaurants/:id
exports.getRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.storeId);

    if (!restaurant) {
        return next(new ErrorHandler("No Restaurant found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: restaurant,
    });
});

// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants/:id
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

    if (!restaurant) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
    });
});
