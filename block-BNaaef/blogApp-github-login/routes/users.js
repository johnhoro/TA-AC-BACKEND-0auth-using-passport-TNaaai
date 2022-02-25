var express = require("express");
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/signup", (req, res, next) => {
  var exist = req.flash(`exist`);
  var min = req.flash(`min`);
  res.render("signup", { exist, min });
});

router.post("/signup", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);
    if (user) {
      req.flash(`exist`, `Email is already registered`);
      return res.redirect(`/users/signup`);
    }
    if (req.body.password.length < 5) {
      req.flash(`min`, `Password is less than 5 character`);
      return res.redirect(`/users/signup`);
    }
    User.create(req.body, (err, user) => {
      console.log(user);
      if (err) return next(err);
      return res.redirect(`/users/login`);
    });
  });
});

router.get("/login", (req, res, next) => {
  var ep = req.flash(`ep`);
  var email = req.flash(`email`);
  var password = req.flash(`password`);
  res.render("login", { ep, email, password });
});

router.post("/login", function (req, res, next) {
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
      return res.redirect("/");
    });
  });
});
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie();
  res.redirect("/users/login");
});

module.exports = router;
