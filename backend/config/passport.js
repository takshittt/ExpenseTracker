const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");

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
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth callback received for profile:", profile.id);

        // Check if user already exists by googleId
        let user = await userModel.findOne({ googleId: profile.id });

        if (!user) {
          // If not found by googleId, try finding by email
          user = await userModel.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            user.isVerified = true;
            if (
              profile.photos &&
              profile.photos[0] &&
              profile.photos[0].value
            ) {
              user.profilePicture = profile.photos[0].value;
            }
            await user.save();
            console.log(
              "Updated existing user with Google credentials:",
              user.email
            );
          } else {
            // Create a new user
            // Generate a random password for the user (never used for OAuth)
            const randomPassword =
              Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8);
            const hashedPassword = await userModel.hashPassword(randomPassword);

            user = await userModel.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: hashedPassword,
              googleId: profile.id,
              profilePicture:
                profile.photos && profile.photos[0]
                  ? profile.photos[0].value
                  : null,
              isVerified: true, // Auto-verify OAuth users
            });

            console.log("New user created via Google OAuth:", user.email);
          }
        } else {
          console.log("Existing Google user found:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
