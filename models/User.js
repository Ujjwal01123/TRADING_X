const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["buy", "sell"], required: true },
  asset: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["admin", "user"] },

  // market
  balance: {
    INR: { type: Number, default: 10000 },
  },

  portfolio: {
    type: Map,
    of: Number,
    default: {},
  },

  watchlist: {
    type: [String],
    default: [],
  },

  pendingTransactions: [transactionSchema],
});

module.exports = mongoose.model("User", userSchema);
