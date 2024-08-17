const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    owner_id: {
      type: String,
      required: true,
    },
    members_id: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: false,
      default:1,
    },
    group_picture: {
      type: String,
      required: false,
    },
    nickname: {
      type: [Map],
      of: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);