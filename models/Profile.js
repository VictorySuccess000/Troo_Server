const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  avatar: {
    type:String,
    trim: true,
  },  
  backimg: {
    type:String,
    trim: true,
  },
  name: {
    type:String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  country: {
    type:String,
    trim: true,
  },
  city: {
    type:String,
    trim: true,
  },
  following: [
    {
      user: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  followers: [
    {
      user: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Profile", ProfileSchema);
