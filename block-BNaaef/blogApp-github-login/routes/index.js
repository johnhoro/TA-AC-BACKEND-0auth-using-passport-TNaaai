var express = require("express");
var router = express.Router();
var User = require(`../models/user`);

/* GET home page. */
router.get("/", function (req, res, next) {
  var session = req.session.userId;
  User.findById(session, (err, user) => {
    console.log(user);
    if (err) return next(err);
    res.render("index", { title: "Express", user: user });
  });
});

module.exports = router;
