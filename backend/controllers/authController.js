const userModel = require("../models/user.model");
const userService = require("../services/userService");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { name, email, password } = req.body;

  const isUserAlreadyRegistered = await userModel.findOne({ email });

  if (isUserAlreadyRegistered) {
    return res.status(400).json({ error: "User already registered" });
  }

  const hashedPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    name,
    email,
    password: hashedPassword,
  });

  const token = user.generateAuthToken();

  // Set the authentication cookie
  res.cookie("token", token);

  res.status(201).json({ token, user });
};

module.exports.signinUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, user });
};

module.exports.googleAuthCallback = async (req, res) => {
  try {
    console.log("Google auth callback received");

    if (!req.user) {
      console.error("No user object in request");
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=authentication_failed`
      );
    }

    console.log("User authenticated successfully:", req.user.email);
    const token = req.user.generateAuthToken();

    // Set cookie with proper options
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect to frontend with token in URL
    const redirectUrl = `${process.env.CLIENT_URL}/auth-success?token=${token}`;
    console.log("Redirecting to:", redirectUrl);

    // Redirect to frontend
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=server_error`);
  }
};

module.exports.getUserProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports.SignoutUser = async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "User logged out successfully" });
};
