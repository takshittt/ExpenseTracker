const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user.model');

// Serialize user id to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Log environment variables for debugging (without exposing secrets)
console.log("Google OAuth Configuration:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- CLIENT_URL:", process.env.CLIENT_URL);
console.log("- GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      proxy: true // Important for handling proxied requests
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth callback received for profile:", profile.id);
        
        // Check if user already exists
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, return the user
          console.log("Existing user found:", user.email);
          return done(null, user);
        }

        // Create a new user if doesn't exist
        const password = await userModel.hashPassword(
          Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        );

        user = await userModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: password,
          isVerified: true, // Auto-verify users signing up with OAuth
          provider: 'google',
          providerId: profile.id
        });
        
        console.log("New user created via Google OAuth:", user.email);

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 