const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
  try {
    // Get token from either cookie or Authorization header
    const token = req.cookies.token || 
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if token is blacklisted
    const isBlacklisted = await blacklistTokenModel.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({ error: "Token has been invalidated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Set user in request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    return res.status(401).json({ error: "Authentication failed" });
  }
};
