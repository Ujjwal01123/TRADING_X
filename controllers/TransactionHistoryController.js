const Transaction = require("../models/Transaction");

// 📌 Save any transaction in history
exports.logTransaction = async (data) => {
  try {
    await Transaction.create(data);
  } catch (err) {
    console.error("Error saving transaction history:", err);
  }
};

// 📌 USER: Get all their transactions (history)
exports.getUserTransactions = async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", err });
  }
};

// 📌 ADMIN: Get ALL transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all transactions", err });
  }
};

// 📌 ADMIN: Get total of all approved buys
exports.getTotalApprovedBuys = async (req, res) => {
  try {
    // Find all approved buy transactions
    const transactions = await Transaction.find({
      type: "buy",
      status: "approved",
    });

    // Sum the total for each transaction
    const totalAmount = transactions.reduce((sum, tx) => {
      return sum + tx.qty * tx.price;
    }, 0);

    res.json({ totalApprovedBuys: totalAmount });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error calculating total approved buys", err });
  }
};
