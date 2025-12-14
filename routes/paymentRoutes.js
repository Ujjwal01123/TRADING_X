const express = require("express");
const router = express.Router();
const {
  savePaymentDetails,
  getPaymentDetails,
  getPaymentDetailsById,
} = require("../controllers/paymentController");
const getUpload = require("../middleware/upload"); // Import your getUpload helper
const { protect, admin } = require("../middleware/authMiddleware"); // JWT auth

// Initialize upload middleware for 'qrcodes' folder
const upload = getUpload("qrcodes");

// Save or update payment details
router.post("/save", protect, upload.single("upiQrCode"), savePaymentDetails);

// Get user's payment details
router.get("/me", protect, getPaymentDetails);
router.get("/user/:id", admin, getPaymentDetailsById);

module.exports = router;
