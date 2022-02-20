var express = require("express");
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");
var User = require("../models/user");
var auth = require("../middlewares/auth");

router.get("/", (req, res, next) => {
  console.log(req.session.passport);
  var session = req.session.userId;
  console.log(session);
  Article.find({}, (err, content) => {
    if (err) next(err);
    User.findById(session, (err, user) => {
      if (err) return next(err);
      return res.render("articles", {
        articles: content,
        user: user,
      });
    });
  });
});

router.get("/:id/detail", auth.loggedInUser, (req, res, next) => {
  var session = req.session.userId;
  Article.findById(req.params.id)
    .populate("comments")
    .exec((err, content) => {
      if (err) return next(err);
      User.findById(session, (err, user) => {
        if (err) return next(err);
        console.log(req.session.userId);
        return res.render("detail", { data: content, user: user });
      });
    });
});

router.use(auth.loggedInUser);

router.get("/new", (req, res, next) => {
  return res.render("newArticle");
});

router.post("/", (req, res, next) => {
  var data = req.body;
  data.authorId = req.user.id;
  Article.create(data, (err, content) => {
    console.log(content);
    if (err) return next(err);
    res.redirect("/article");
  });
});

router.get("/:slug/like", (req, res, next) => {
  let slug = req.params.slug;
  let id = req.session.userId;
  Article.findOne({ slug }, (err, content) => {
    console.log(content);
    if (content.likes.includes(id)) {
      content.likes.pull(id);
      content.save((err, content) => {
        if (err) return next(err);
        res.redirect("/article/" + content._id + "/detail");
      });
    } else {
      content.likes.push(id);
      content.save((err, content) => {
        if (err) return next(err);
        res.redirect("/article/" + content._id + "/detail");
      });
    }
  });
});

router.get("/:slug/edit", (req, res, next) => {
  console.log("hi");
  Article.findOne(req.params.id, (err, content) => {
    console.log(content);
    if (err) return next(err);
    if (content.authorId._id.toString() === req.user._id.toString()) {
      res.render("editArticle", { data: content });
    } else {
      res.redirect("/users/login");
    }
  });
});

router.post("/:slug/edit", (req, res, next) => {
  console.log("hi");
  Article.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    { new: true },
    (err, content) => {
      if (err) return next(err);
      console.log(content);
      res.redirect("/article/" + content.slug);
    }
  );
});

router.get("/:id/delete", (req, res, next) => {
  var id = req.params.id;
  Article.findById(id, (err, content) => {
    if (err) return next(err);
    if (content.authorId._id.toString() === req.user._id.toString()) {
      Article.findByIdAndDelete(id, (err, content) => {
        if (err) return next(err);
        Comment.deleteMany({ articleId: id }, (err, content) => {
          if (err) return next(err);
          console.log(content);
          res.redirect("/article");
        });
      });
    } else {
      res.redirect("/users/login");
    }
  });
});

router.post("/:id/comment", (req, res, next) => {
  req.body.aticleId = req.params.id;
  req.body.userId = req.user._id;
  Comment.create(req.body, (err, content) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: content._id } },
      (err, article) => {
        if (err) return next(err);
        res.redirect("/article/" + article.slug);
      }
    );
  });
});

router.get("/:slug", (req, res, next) => {
  var slug = req.params.slug;
  var session = req.session.userId;
  Article.findOne({ slug })
    .populate("comments")
    .exec((err, content) => {
      if (err) return next(err);
      res.render("detail", { data: content, session });
    });
});

module.exports = router;
