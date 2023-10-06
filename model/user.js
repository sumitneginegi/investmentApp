const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Name: String,
    mobile: String,
    email: String,
    otp: String,
    address: String,
    date: String,
    startTime: String,
    endTime: String,
    wallet: {
      type: Number,
      default: 0
    },
    userType: {
      type: String
    },
    subscriptions: [
      {
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "plans" // This should match the model name of your plans
        },
        payment_status: {
          type: String,
          default: "false"
        },
        daysleft: {
          type: Number,
          default: 0
        },
        date: {
          type: Date
        },
        updatedDate:{
          type:Date
        },
        wallet: [
          {
            amount: {
              type: Number,
              default: 0
            },
            dateAdded: {
              type: Date,
              default: Date.now
            },
            planId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "plans"
            }
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

// Middleware to automatically update the date field when payment_status is set to true
UserSchema.pre("save", function (next) {
  if (this.subscriptions && this.subscriptions.length > 0) {
    const updatedSubscriptions = this.subscriptions.filter(
      (subscription) => subscription.payment_status === true && !subscription.date
    );

    updatedSubscriptions.forEach((subscription) => {
      subscription.date = new Date();
    });
  }
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
