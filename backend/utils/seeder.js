const Fooditem = require("../models/foodItem");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const fooditems = require("../data/foodItem.json");
const { connect } = require("mongoose");

// Load biến môi trường
dotenv.config({ path: "backend/config/config.env" });

// Kết nối database
connectDatabase();

const seedFooditems = async () => {
  try {
    // Xoá toàn bộ dữ liệu cũ
    await Fooditem.deleteMany();

    // Thêm dữ liệu từ file JSON
    await Fooditem.insertMany(fooditems);

    console.log("✅ Data imported successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error while seeding:", error.message);
    process.exit(1);
  }
};

seedFooditems();
