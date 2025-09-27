const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    phoneNo: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      fooditem: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "FoodItem",
      },
    },
  ],
  paymentInfo: {
    id: { type: String },
    status: { type: String },
  },
  paidAt: { type: Date },
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  deliveryCharge: { type: Number, required: true, default: 0 },
  finalTotal: { type: Number, required: true, default: 0 },
  orderStatus: { type: String, required: true, default: "Processing" },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Middleware: trước khi lưu order, kiểm tra stock của từng fooditem
orderSchema.pre("save", async function (next) {
  try {
    for (const item of this.orderItems) {
      const food = await mongoose.model("FoodItem").findById(item.fooditem);
      if (!food) throw new Error("Food item not found.");
      if (food.stock < item.quantity) {
        throw new Error(`Insufficient stock for '${item.name}' in this order.`);
      }
      food.stock -= item.quantity; // trừ stock
      await food.save();
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Order", orderSchema);
