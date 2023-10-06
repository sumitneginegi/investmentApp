const mongoose = require("mongoose");
const objectid = mongoose.Schema.Types.ObjectId;

const paymentSchema = mongoose.Schema({
  planId:  {
    type: objectid,
    ref: "plans",
  },
  userId:{
    type:objectid,
    ref:"User"
  },
  status: {
    type: String,
    default: "pending",
  },
  receipt: {
    type: String,
  },
  amount: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  paymentMethod: {
    type: String,
    default: "upi",
    enum: [
      "upi",
      "DebitCard",
      "Debitcard",
      "debitcard",
      "creditcard",
      "CreditCard",
    ],
  },
  razorpayOrderId:{
    type:String,
  }
},
{
  timestamps: true
});
const payment = mongoose.model("payment", paymentSchema);
module.exports = payment;