const PaymentDetails = require("../models/payment_details");
const fs = require("fs");
const path = require("path");

// CREATE or UPDATE payment details
const savePaymentDetails = async (req, res) => {
  try {
    const userId = req.userId;
    // Multer moves text fields to req.body and file to req.file
    const { bankName, accountNumber, ifsc, upiId } = req.body;

    // Check if a file was uploaded
    const qrCodePath = req.file
      ? `/uploads/qrcodes/${req.file.filename}`
      : undefined;

    let payment = await PaymentDetails.findOne({ user: userId });

    if (payment) {
      // Update existing
      payment.bankName = bankName;
      payment.accountNumber = accountNumber;
      payment.ifsc = ifsc;
      payment.upiId = upiId;

      if (qrCodePath) {
        // OPTIONAL: Delete old image file to save server space
        if (payment.upiQrCode) {
          const oldPath = path.join(__dirname, "..", payment.upiQrCode);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Save new path
        payment.upiQrCode = qrCodePath;
      }

      await payment.save();
      return res.json({ success: true, payment });
    }

    // Create new
    const newPayment = await PaymentDetails.create({
      user: userId,
      bankName,
      accountNumber,
      ifsc,
      upiId,
      upiQrCode: qrCodePath || "", // Save path or empty string
    });

    res.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Save Payment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getPaymentDetails = async (req, res) => {
  // ... (Your existing get logic is fine)
  try {
    const userId = req.userId;
    const payment = await PaymentDetails.findOne({ user: userId });

    // Ensure the QR code URL is full path if needed, or handle on frontend
    res.json({ success: true, payment });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getPaymentDetailsById = async (req, res) => {
  try {
    const { userId } = req.params; // <-- get userId from URL params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch payment details of the user
    const payment = await PaymentDetails.findOne({ user: userId }).populate(
      "user",
      "name email"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment details found for this user",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  savePaymentDetails,
  getPaymentDetails,
  getPaymentDetailsById,
};
