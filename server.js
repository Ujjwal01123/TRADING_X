const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const rateLimit = require("express-rate-limit");

dotenv.config();

// MongoDB Connect
connectDB();

const app = express();

// -----------------------
// CORS Configuration
// -----------------------
const allowedOrigins = [
  "https://mkfrx.netlify.app",
  "https://admin-mkfrx.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or Postman
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies or authorization headers
  })
);

// -----------------------
// Rate Limiter Middleware
// -----------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiter to all API routes
app.use("/api", limiter);

// -----------------------
// Middleware
// -----------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploads folder (images etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------
// Routes
// -----------------------
const authRoutes = require("./routes/authRoutes.js");
const blogRoutes = require("./routes/blogRoutes.js");
const contactRoutes = require("./routes/contactRoutes");
const marketRoutes = require("./routes/marketRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);

// -----------------------
// Default Route
// -----------------------
app.get("/", (req, res) => {
  res.send("API Running Successfully...");
});

// -----------------------
// Start Server
// -----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
