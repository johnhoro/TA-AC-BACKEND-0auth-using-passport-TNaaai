var express = require("express");
var router = express.Router();
var User = require("../models/user");
var auth = require("../middlewares/auth");
var Article = require("../models/article");
var passport = require("passport");

/* GET users listing. */
router.get("/", auth.loggedInUser, function (req, res, next) {
  Article.find({ author: req.user._id })
    .populate("author", "username")
    .exec((err, articles) => {
      if (err) return next(err);
      res.render("allArticles", { articles });
    });
});

//register user

router.get("/register", function (req, res, next) {
  var exist = req.flash(`exist`);
  var min = req.flash(`min`);
  res.render("register", { exist, min });
});

router.post("/register", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);
    if (user) {
      req.flash(`exist`, `Email is already registered`);
      return res.redirect(`/users/register`);
    }
    if (req.body.password.length < 5) {
      req.flash(`min`, `Password is less than 5 character`);
      return res.redirect(`/users/register`);
    }
    User.create(req.body, (err, user) => {
      if (err) return next(err);
      res.redirect(`/users/login`);
    });
  });
});

//user login

router.get("/login", (req, res, next) => {
  var ep = req.flash(`ep`);
  var email = req.flash(`email`);
  var password = req.flash(`password`);
  res.render("login", { ep, email, password });
});

router.post("/login", (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash("ep", "Email/Password required!");
    return res.redirect("/users/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("email", "This email is not registered");
      return res.redirect("/users/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("password", "Incorrect password! Try Again!");
        return res.redirect("/users/login");
      }
      //password match
      req.session.userId = user.id;
      req.session.userType = user.userType;
      return res.redirect("/articles");
    });
  });
});

router.get("/logout", (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.clearCookie("connect-sid");
  return res.redirect("/users/login");
});

//github&google

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/users/login" }),
  (req, res) => {
    res.redirect("/users");
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/login" }),
  (req, res) => {
    res.redirect("/users");
  }
);

module.exports = router;
