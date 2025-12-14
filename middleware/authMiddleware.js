const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin Protect — works SAME as protect but checks for admin role too
const admin = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protect, admin };
