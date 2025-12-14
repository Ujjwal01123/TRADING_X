const express = require("express");
const {
  getTickers,
  // totalCount,
  getTotalAssetsCount,
} = require("../controllers/marketController.js");
const {
  buyAsset,
  sellAsset,
  approveTransaction,
  rejectTransaction,
  getTotalPendingRequests,
} = require("../controllers/portfolioController.js");
const { toggleWatchlist } = require("../controllers/watchlistController.js");
const {
  getTotalApprovedBuys,
  getAllTransactions,
} = require("../controllers/TransactionHistoryController");

const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();
router.get("/tickers", getTickers);
router.get("/count", getTotalAssetsCount);
router.post("/:userId/buy", buyAsset);
router.post("/:userId/sell", sellAsset);
router.post("/:userId/toggle", toggleWatchlist);
//
router.post("/approve/:userId/:txId", protect, approveTransaction);
router.post("/reject/:userId/:txId", protect, rejectTransaction);

// // User
// router.get("/:userId", getUserTransactions);

// ADMIN
router.get("/admin/all", protect, getAllTransactions);
router.get("/total/amount/all", getTotalApprovedBuys);
router.get("/total/pending", getTotalPendingRequests);

module.exports = router;
