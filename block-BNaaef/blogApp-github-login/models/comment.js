var mongoose = require(`mongoose`);
var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
    author: String,
  },
  { timestamps: true }
);

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
