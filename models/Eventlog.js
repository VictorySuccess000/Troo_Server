const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventlogSchema = new mongoose.Schema({
  blog_id: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
  evnet_type: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Eventlog", EventlogSchema);
