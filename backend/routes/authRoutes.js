const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const passport = require("passport");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("name")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.registerUser
);

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.signinUser
);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: process.env.NODE_ENV === 'production' 
      ? 'https://your-frontend-domain.com/signin'  // Replace with your actual frontend domain
      : 'http://localhost:3000/signin',
    session: false 
  }),
  authController.googleAuthCallback
);

router.get("/profile", authMiddleware.authUser, authController.getUserProfile);

router.get("/Signout", authMiddleware.authUser, authController.SignoutUser);

module.exports = router;
