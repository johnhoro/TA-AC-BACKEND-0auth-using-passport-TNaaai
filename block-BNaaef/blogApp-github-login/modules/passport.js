var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
var GoogleStrategy = require("passport-google-oauth20").Strategy;

var User = require("../models/user");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      var profileData = {
        name: profle.displayName,
        username: profile.username,
        email: profile._json.email,
      };
      User.findOne({ username: profile.username }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, newUser) => {
            if (err) return done(err);
            return done(null, newUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      let profileData = {
        name: profile.displayName,
        username: profile.username,
      };
      User.findOne({ name: profile.displayName }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          User.create(profileData, (err, newUser) => {
            if (err) {
              return done(err);
            }
            return done(null, newUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
