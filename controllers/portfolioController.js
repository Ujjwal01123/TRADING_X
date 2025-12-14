const MarketUser = require("../models/User");
const { logTransaction } = require("./TransactionHistoryController");

const buyAsset = async (req, res) => {
  const { userId } = req.params;
  const { asset, qty, price } = req.body;

  try {
    const user = await MarketUser.findById(userId);

    const total = price * qty;

    if (user.balance.INR < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Add transaction as pending
    user.pendingTransactions.push({
      userId,
      type: "buy",
      asset,
      qty,
      price,
      status: "pending",
    });

    // Log history
    logTransaction({
      // ✅ Add name here
      userId,
      type: "buy",
      asset,
      qty,
      price,
      status: "pending",
    });

    await user.save();

    res.json({
      message: `Buy request for ${qty} ${asset} submitted and pending admin approval`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error submitting buy request", err });
  }
};

const sellAsset = async (req, res) => {
  const { userId } = req.params;
  const { asset, qty, price } = req.body;

  try {
    const user = await MarketUser.findById(userId);

    const holding = user.portfolio.get(asset) || 0;
    if (holding < qty) {
      return res.status(400).json({ message: "Not enough holdings" });
    }

    // Add pending sell request (just like buy)
    user.pendingTransactions.push({
      userId,
      type: "sell",
      asset,
      qty,
      price,
      status: "pending",
    });

    // Log pending sell transaction
    logTransaction({
      userId,
      type: "sell",
      asset,
      qty,
      price,
      status: "pending",
    });

    await user.save();

    res.json({
      message: `Sell request for ${qty} ${asset} submitted and pending admin approval`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error submitting sell request", err });
  }
};

const approveTransaction = async (req, res) => {
  const { userId, txId } = req.params;

  try {
    const user = await MarketUser.findById(userId);

    const tx = user.pendingTransactions.id(txId);
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (tx.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const total = tx.qty * tx.price;

    if (tx.type === "buy") {
      if (user.balance.INR < total) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      user.balance.INR -= total;
      user.portfolio.set(
        tx.asset,
        (user.portfolio.get(tx.asset) || 0) + tx.qty
      );
    }

    if (tx.type === "sell") {
      const holding = user.portfolio.get(tx.asset) || 0;

      if (holding < tx.qty) {
        return res.status(400).json({
          message: "Not enough asset to approve sell",
        });
      }

      user.portfolio.set(tx.asset, holding - tx.qty);
      user.balance.INR += total;
    }

    tx.status = "approved";

    logTransaction({
      userId,
      type: tx.type,
      asset: tx.asset,
      qty: tx.qty,
      price: tx.price,
      status: "approved",
    });

    await user.save();

    res.json({ message: "Transaction approved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error approving transaction", error });
  }
};

const rejectTransaction = async (req, res) => {
  const { userId, txId } = req.params;

  try {
    const user = await MarketUser.findById(userId);

    const tx = user.pendingTransactions.id(txId);
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // if (tx.status !== "pending") {
    //   return res.status(400).json({ message: "Transaction already processed" });
    // }

    tx.status = "rejected";

    logTransaction({
      userId,
      type: tx.type,
      asset: tx.asset,
      qty: tx.qty,
      price: tx.price,
      status: "rejected",
    });

    await user.save();

    res.json({ message: "Transaction rejected", user });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting transaction", error });
  }
};

// 📌 ADMIN: Get total number of pending transactions
const getTotalPendingRequests = async (req, res) => {
  try {
    // Find all users
    const users = await MarketUser.find();

    // Count all pending transactions
    const totalPending = users.reduce((count, user) => {
      return (
        count +
        user.pendingTransactions.filter((tx) => tx.status === "pending").length
      );
    }, 0);

    res.json({ totalPending });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching total pending requests", err });
  }
};

module.exports = {
  getTotalPendingRequests,
  buyAsset,
  sellAsset,
  approveTransaction,
  rejectTransaction,
};
