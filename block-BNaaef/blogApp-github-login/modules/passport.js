var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
var GoogleStrategy = require(`passport-google-oauth20`).Strategy;
var User = require("../models/user");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      let newUser = {
        firstname: profile.displayName.split(" ")[0],
        lastname: profile.displayName.split(" ").splice(1).join(" "),
        email: profile._json.email,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(newUser, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
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
    function (request, accessToken, refreshToken, profile, done) {
      let newUser = {
        firstname: profile.displayName.split(" ")[0],
        lastname: profile.displayName.split(" ").splice(1).join(" "),
        email: profile._json.email,
      };
      User.findOne({ email: profile.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(newUser, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
