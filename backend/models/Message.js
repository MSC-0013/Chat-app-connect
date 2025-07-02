const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  text: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  hiddenFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

MessageSchema.pre('validate', function(next) {
  if (!this.receiver && !this.group) {
    next(new Error('Message must have either a receiver or a group'));
  } else {
    next();
  }
});

module.exports = mongoose.model("Message", MessageSchema);
