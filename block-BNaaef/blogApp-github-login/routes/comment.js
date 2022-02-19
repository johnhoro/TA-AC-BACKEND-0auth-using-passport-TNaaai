var express = require("express");

var router = express.Router();

var User = require("../models/user");
var Article = require("../models/article");
var Comment = require("../models/comment");
var auth = require("../middlewares/auth");

router.use(auth.loggedInUser);

router.get("/:id/edit", (req, res, next) => {
  var id = req.params.id;
  Comment.findById(id)
    .populate("author", "fullName")
    .exec((err, comment) => {
      if (comment.author.id !== req.user.id) {
        return res.redirect("/articles/" + comment.articleId);
      }
      res.render("updateComment", { comment });
    });
});

router.post("/:id", (req, res, next) => {
  var id = req.params.id;
  Comment.findById(id)
    .populate("author", "username")
    .exec((err, comment) => {
      if (err) return next(err);
      if (comment.author.id !== req.user.id) {
        return res.redirect("/articles/" + comment.articleId);
      }
      Comment.findByIdAndUpdate(id, req.body, (err, commentUpdated) => {
        if (err) return next(err);
        return res.redirect("/articles/" + commentUpdated.articleId);
      });
    });
});

router.get("/:id/delete", (req, res, next) => {
  var id = req.params.id;
  Comment.findById(id)
    .populate("author", "fulllName")
    .exec((err, comment) => {
      if (err) return next(err);
      if (comment.author.id !== req.user.id) {
        return res.redirect("/articles/" + comment.articleId);
      }
      Comment.findByIdAndDelete(id, (err, commentDeleted) => {
        if (err) return next(err);
        return res.redirect("/articles/" + commentDeleted.articleId);
      });
    });
});

router.get("/:id/like", (req, res, next) => {
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, liked) => {
    if (err) return next(err);
    return res.redirect("/articles/" + liked.articleId);
  });
});

module.exports = router;
