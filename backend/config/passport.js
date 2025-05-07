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

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, return the user
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

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 