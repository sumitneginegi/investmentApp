const mongoose = require("mongoose");
const objectId = mongoose.Types.ObjectId;
const planSchema = mongoose.Schema({
  userId: {
    type: objectId,
    ref: "User",
  },
  planName: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // Duration in days, months, etc.
    required: true,
  },

});
const planModel = mongoose.model("plans", planSchema);

module.exports = planModel;
