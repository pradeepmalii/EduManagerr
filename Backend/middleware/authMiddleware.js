const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("Auth middleware - Path:", req.path);
  console.log("Auth middleware - Headers:", req.headers);
  
  const authHeader = req.header("Authorization") || req.headers["authorization"];

  if (!authHeader) {
    console.log("Auth middleware - No authorization header");
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("Auth middleware - No token in header");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Token verified");
    req.admin = decoded;
    next();
  } catch (error) {
    console.log("Auth middleware - Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
