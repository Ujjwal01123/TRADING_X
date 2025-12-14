const express = require("express");
const {
  signup,
  login,
  getTotalUsers,
  getAllUsers,
  deleteUserById,
  getUserById,
  changePassword,
} = require("../controllers/authController.js");

const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/total-users", getTotalUsers);
router.get("/user/all", protect, getAllUsers);
router.get("/:id", getUserById);
router.delete("/delete/:id", protect, deleteUserById);
router.post("/signup", signup);
router.post("/login", login);

// NEW CHANGE PASSWORD ROUTE
router.put("/change-password", protect, changePassword);

module.exports = router;
