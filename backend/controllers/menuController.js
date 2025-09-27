const Menu = require("../models/menu");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const Restaurant = require("../models/restaurant");

// @desc    Get all menus
// @route   GET /api/v1/menus
exports.getAllMenus = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.storeId) {
        filter = { restaurant: req.params.storeId };
    }

    const menus = await Menu.find(filter)
        .populate({ path: "menu.items", model: "FoodItem" })
        .exec();

    res.status(200).json({
        status: "success",
        count: menus.length,
        data: menus,
    });
});

// @desc    Create new menu
// @route   POST /api/v1/menus
exports.createMenu = catchAsync(async (req, res, next) => {
    const newMenu = await Menu.create(req.body);

    res.status(201).json({
        status: "success",
        data: newMenu,
    });
});

// @desc    Delete a menu
// @route   DELETE /api/v1/menus/:menuId
exports.deleteMenu = catchAsync(async (req, res, next) => {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);

    if (!menu) {
        return next(new ErrorHandler("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
    });
});
