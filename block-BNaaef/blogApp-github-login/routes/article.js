var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Article = require("../models/article");
var Comment = require("../models/comment");
var auth = require("../middlewares/auth");

router.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    res.render("allArticles", { articles });
  });
});

router.get("/new", auth.loggedInUser, (req, res) => {
  res.render("addArticle");
});

router.post("/", (req, res, next) => {
  req.body.author = req.user._id;
  Article.create(req.body, (err, articleCreated) => {
    if (err) return next(err);
    return res.redirect("/users");
  });
});

router.get("/:slug", (req, res) => {
  var slug = req.params.slug;
  Article.findOne({ slug })
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username" },
    })
    .exec((err, article) => {
      if (err) return next(err);
      res.render("singleArticle", { article });
    });
});

router.use(auth.loggedInUser);

router.get("/:slug/edit", (req, res) => {
  var slug = req.params.slug;
  Article.findOne({ slug })
    .populate("author", "username")
    .exec((err, article) => {
      if (err) return next(err);
      if (article.author.id !== req.user.id) {
        return res.redirect("/articles/" + slug);
      }
      res.render("updateArticle", { article });
    });
});

router.get("/:slug/delete", (req, res, next) => {
  var slug = req.params.slug;
  Article.findOne({ slug })
    .populate("author", "username")
    .exec((err, article) => {
      if (err) return next(err);
      if (article.author.id !== req.user.id) {
        return res.redirect("/articles/" + slug);
      }
      Article.findOneAndDelete({ slug }, (err, articleDeleted) => {
        if (err) return next(err);
        Comment.deleteMany(
          { articleId: articleDeleted.id },
          (err, deletedComment) => {
            if (err) return next(err);
            return res.redirect("/users");
          }
        );
      });
    });
});

router.post("/:slug", (req, res, next) => {
  var slug = req.params.slug;
  Article.findOne({ slug })
    .populate("author", "username")
    .exec((err, article) => {
      if (err) return next(err);
      if (article.author.id !== req.user.id) {
        return res.redirect("/articles/" + slug);
      }
      Article.findOneAndUpdate({ slug }, req.body, (err, articleUpdate) => {
        if (err) return next(err);
        return res.redirect("/users");
      });
    });
});

router.post("/:slug/comment", (req, res, next) => {
  var slug = req.params.slug;
  req.body.articleId = slug;
  req.body.author = req.user.id;
  Comment.create(req.body, (err, comment) => {
    console.log(comment);
    if (err) return next(err);
    Article.findOneAndUpdate(
      { slug: slug },
      { $push: { comments: comment.id } },
      (err, articleUpdated) => {
        if (err) return next(err);
        return res.redirect("/articles/" + articleUpdated.slug);
      }
    );
  });
});

router.get("/:slug/:method", (req, res, next) => {
  var slug = req.params.slug;
  var method = req.params.method;
  if (method === "like") {
    Article.findOneAndUpdate(
      { slug: slug },
      { $inc: { likes: 1 } },
      (err, liked) => {
        if (err) return next(err);
        return res.redirect("/articles/" + liked.slug);
      }
    );
  }
  if (method === "dislike") {
    Article.findOneAndUpdate(
      { slug: slug },
      { $inc: { likes: -1 } },
      (err, disliked) => {
        if (err) return next(err);
        return res.redirect("/articles/" + disliked.slug);
      }
    );
  }
});

module.exports = router;
