const express = require("express");
const getUpload = require("../middleware/upload.js");
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getTotalBlogs,
  getBlogBySlug,
} = require("../controllers/blogController.js");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware.js");

// Use dynamic upload middleware for blogs
const upload = getUpload("blogs"); // Uploads go to /uploads/blogs

// ------------------- ROUTES -------------------

//  GET TOTAL BLOGS (static route first!)
router.get("/total", protect, getTotalBlogs);

//  GET ALL BLOGS
router.get("/", getBlogs);

//  GET SINGLE BLOG BY ID (dynamic route)
router.get("/:id", protect, getBlogById);

router.get("/slug/:slug", getBlogBySlug);

//  CREATE BLOG
router.post("/", protect, upload.single("image"), createBlog);

//  UPDATE BLOG
router.put("/:id", protect, upload.single("image"), updateBlog);

//  DELETE BLOG
router.delete("/:id", protect, deleteBlog);

module.exports = router;
