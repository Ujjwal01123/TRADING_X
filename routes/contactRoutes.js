const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  getContacts,
  getContactById,
  deleteContact,
} = require("../controllers/contactController");

const { protect } = require("../middleware/authMiddleware.js");

// Public route for form submission
router.post("/submit", protect, submitContactForm);

// Admin route to get all contacts
router.get("/", protect, getContacts);
router.get("/:id", protect, getContactById);
router.delete("/:id", protect, deleteContact);

module.exports = router;
