const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    count: { type: Number, default: 0 },
    isRoot: { type: Boolean, default: false },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // This option automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
