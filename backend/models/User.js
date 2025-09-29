const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  bio: {
    type: String,
    default: "",
  },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: { type: Date, default: Date.now },

  // 👇 New: link fingerprint to the same account
  fingerprintId: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
