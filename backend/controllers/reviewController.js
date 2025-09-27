const AppError = require("../utils/errorHandler");
const Review = require("../models/reviewModel");
const catchAsync = require("../middlewares/catchAsyncErrors");

// Middleware: set user và restaurantId vào body
exports.setUserRestaurantIds = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;
    if (!req.body.restaurant) req.body.restaurant = req.params.storeId;
    next();
};

// @desc    Create review
// @route   POST /api/v1/restaurants/:storeId/reviews
exports.createReviews = catchAsync(async (req, res, next) => {
    const review = await Review.create(req.body);

    res.status(201).json({
        status: "success",
        data: review,
    });
});

// @desc    Get all reviews (optionally filter by restaurant)
// @route   GET /api/v1/reviews OR /api/v1/restaurants/:storeId/reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.storeId) filter = { restaurant: req.params.storeId };

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: "success",
        data: reviews,
    });
});

// @desc    Get review by ID
// @route   GET /api/v1/reviews/:reviewId
exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return next(new AppError("No Review with given Id", 404));

    res.status(200).json({
        status: "success",
        data: review,
    });
});

// @desc    Update review
// @route   PATCH /api/v1/reviews/:reviewId
exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
        new: true,
        runValidators: true,
    });

    if (!review) return next(new AppError("No Review with given Id", 404));

    res.status(200).json({
        status: "success",
        data: review,
    });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:reviewId
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.reviewId);

    if (!review) return next(new AppError("No Review with given Id", 404));

    res.status(204).json({
        status: "success",
    });
});
