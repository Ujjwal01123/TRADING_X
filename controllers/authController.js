const User = require("../models/User.js");
const PaymentDetails = require("../models/payment_details.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    res.json({
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch total users",
      error: error.message,
    });
  }
};

// const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select("-password");

    // Fetch all payment details mapped by userId for fast lookup
    const paymentMap = await PaymentDetails.find()
      .select("-__v -createdAt -updatedAt")
      .lean();

    const mapByUser = {};
    paymentMap.forEach((p) => {
      mapByUser[p.user.toString()] = p;
    });

    // Attach payment details to each user
    const usersWithPayments = users.map((user) => ({
      ...user.toObject(),
      paymentDetails: mapByUser[user._id.toString()] || null, // if no record exists → null
    }));

    res.json({
      success: true,
      users: usersWithPayments,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

module.exports = { getAllUsers };

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch payment details of this user
    const paymentDetails = await PaymentDetails.findOne({ user: id })
      .select("-__v -createdAt -updatedAt")
      .lean();

    res.json({
      success: true,
      user,
      paymentDetails: paymentDetails || null, // if not present return null
    });
  } catch (error) {
    console.error("Get User by ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // userId comes from your protect middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update password",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  signup,
  getTotalUsers,
  getAllUsers,
  deleteUserById,
  getUserById,
  changePassword,
};
