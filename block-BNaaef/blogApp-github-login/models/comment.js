var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var commentSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    like: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aticleId: { type: Schema.Types.ObjectId, ref: "Article" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
