const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllMenus,
  createMenu,
  deleteMenu,
} = require("../controllers/menuController");

// GET all menus, POST create menu
router.route("/")
    .get(getAllMenus)
    .post(createMenu);

// DELETE menu by ID
router.route("/:menuId")
    .delete(deleteMenu);

module.exports = router;
