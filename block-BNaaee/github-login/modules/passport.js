var passport = require(`passport`);
var GitHubStrategy = require(`passport-github`).Strategy;
var GitHubStrategy = require(`passport-google-oauth20`).Strategy;

var User = require(`../models/user`);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `/auth/github/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      var profileData = {
        name: profile.displayname,
        username: profile.username,
        email: profile._json.email,
        photo: profile._json.avatar_url,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
          });
        } else {
          done(null, user);
        }
      });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      var profileData = {
        name: profile.displayname,
        username: profile.username,
      };
      User.findOne({ name: profile.displayname }, (err, user) => {
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, "name email username", function (err, user) {
    done(err, user);
  });
});
