var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: { type: String },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
