var express = require("express");
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");
var Users = require("../models/user");
var auth = require("../middlewares/auth");

router.get("/:id/commentlike", (req, res, next) => {
  var id = req.params.id;
  console.log(id);
  Comment.findOne({ _id: req.params.id, like: { $in: id } }, (err, content) => {
    console.log(content);
    if (err) return next(err);
    let isAlreadyAdded = {
      $pull: { like: id },
    };

    if (!content) {
      isAlreadyAdded = {
        $push: { like: id },
      };
    }

    Comment.findOneAndUpdate(
      { _id: req.params.id },
      isAlreadyAdded,
      { new: true },
      (err, updateContent) => {
        if (err) return next(err);
        res.redirect("/article/" + updateContent.aticleId._id + "/detail");
      }
    );
  });
});

router.get("/:id/commentedit", auth.CommentInfo, (req, res, next) => {
  Comment.findById(req.params.id, (err, content) => {
    if (err) return next(err);
    res.render("editComment", { data: content });
  });
});

router.post("/:id/commentedit", (req, res, next) => {
  console.log("hi");
  Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, updateContent) => {
      if (err) return next(err);
      res.redirect("/article/" + updateContent.aticleId._id + "/detail");
    }
  );
});

router.get("/:id/commentdelete", auth.CommentInfo, (req, res, next) => {
  console.log("deleter");
  Comment.findByIdAndDelete(req.params.id, (err, content) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      content.aticleId,
      { $pull: { remarks: content._id } },
      (err, updateEvent) => {
        if (err) return next(err);
        console.log(updateEvent);
        res.redirect("/article/" + updateEvent.slug);
      }
    );
  });
});

module.exports = router;
