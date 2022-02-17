const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HashtagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});
module.exports = mongoose.model("Hashtag", HashtagSchema);
