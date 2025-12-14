const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user has only 1 payment detail record
    },

    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },

    upiId: { type: String, required: true },

    // Store QR code as image URL (use Cloudinary or local upload)
    upiQrCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
