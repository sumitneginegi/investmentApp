const OTP = require("../../config/OTP-Generate");
const User = require("../../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');
// const Notification = require('../models/notification');
const io = require('socket.io')(); // Import the Socket.io instance (make sure it's the same instance as in your main server file)
const objectId = mongoose.Types.ObjectId;

const dbConnect = require("../../config/DBConnect");
// dotenv.config();
dbConnect()

const twilio = require("twilio");
// var newOTP = require("otp-generators");

const reffralCode = async () => {
  var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let OTP = "";
  for (let i = 0; i < 9; i++) {
    OTP += digits[Math.floor(Math.random() * 36)];
  }
  return OTP;
}

const accountSid = "AC0f17e37b275ea67e2e66d289b3a0ef84";
const authToken = "b84ef9419317143ffbff15233a713770";
const twilioPhoneNumber = "+14708354405";
const client = twilio(accountSid, authToken);


exports.sendotpCustomer = async (req, res) => {
  console.log("hi");
  try {
    const { phoneNumber } = req.body

    const otp = Math.floor(1000 + Math.random() * 9000)

    res.status(200).json({ message: "OTP sent successfully", phoneNumber: phoneNumber, otp: otp });
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}



exports.registrationCustomer = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Check if a user with the same mobile number and userType "customer" already exists
    const existingUser = await User.findOne({ mobile: mobile, userType: "customer" });

    if (!existingUser) {
      // Check if a user with the same OTP already exists
      const existingOTPUser = await User.findOne({ otp: otp, userType: "customer" });

      if (!existingOTPUser) {
        // Create the user document
        const newUser = await User.create({
          mobile,
          otp,
          userType: "customer",
          // wallet: 100, // Uncomment and set the wallet value if needed
          // otpExpiration: new Date(Date.now() + 5 * 60 * 1000), // Set OTP expiration if needed
          // accountVerification: false, // Set account verification status if needed
        });

        let obj = {
          id: newUser._id,
          otp: newUser.otp,
          mobile: newUser.mobile,
        };

        res.status(201).json({
          status: 201,
          message: "Registered successfully",
          data: obj,
        });
      } else {
        return res.status(409).json({ status: 409, message: "OTP already exists" });
      }
    } else {
      return res.status(409).json({ status: 409, message: "Mobile number already exists" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.sendotpCustomerLogin = async (req, res) => {
  console.log("hi");
  try {
    const { phoneNumber } = req.body

    const otp = Math.floor(1000 + Math.random() * 9000)

    const user = await User.findOneAndUpdate({ mobile: phoneNumber, userType: "customer" }, { otp: otp }, { new: true })
    if (!user) {
      return res.status(400).json({ message: "phone number not exist" });
    }

    return res.status(200).json({ message: "OTP sent successfully", otp: user.otp });
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}



exports.loginCustomer = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile) {
      return res
        .status(400)
        .json({ error: "Mobile number required" });
    }
    const test = await User.findOne({ mobile: mobile, userType: "customer", });

    if (test) {
      const customer = await User.findOne({ mobile: mobile, userType: "customer", otp: otp });
      if (!customer) {

        return res.status(404).json({ error: "Otp is incorrect" });
      }
    }
    else {
      return res.status(404).json({ error: "customer not found" });
    }

    // employer.otp = otp
    // employer.save()

    const token = jwt.sign({ employerId: test._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        otp,
        customer: test,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}


exports.getAllCustomer = async (req, res) => {
  try {
    const customer = await User.find({ userType: "customer" })
    console.log(customer)

    if (customer.length === 0) {
      return res.status(404).json({ error: "No customer data found." });
    }

    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal server error" });
  }
}


// Function to extract time from the date field
function extractTimeFromDate(date) {
  const extractedTime = new Date(date).toLocaleTimeString();
  console.log(extractedTime);
  return extractedTime;
}

// Function to update the wallet array inside the subscription
async function updateWalletInSubscription(userId, amount, dateAdded, planId) {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found");
      return;
    }

    // Find the subscription in which you want to update the wallet
    const subscription = user.subscriptions.find((sub) =>
      sub.plan && sub.plan._id.equals(planId) // Check if sub.plan._id matches planId
    );

    if (!subscription) {
      console.error("Subscription not found");
      return;
    }


    // Check if the wallet array has reached the maximum limit (e.g., 30 items)
    if (subscription.wallet.length > 30) {
      console.error("Wallet array already reached the maximum limit");
      return;
    }

    // Update the wallet array inside the subscription
    subscription.wallet.push({
      amount,
      dateAdded,
      planId,
    });

    // Save the updated user document
    await user.save();

    console.log({ msg: "Wallet updated successfully", user: user });
  } catch (error) {
    console.error("Error updating wallet:", error);
  }
}




exports.creditProfitToUserWallet = async (req, res) => {
  // Schedule a job to run every day at 5 PM
  // cron.schedule("0 17 * * *", async () => {
  try {
    // Fetch users with subscriptions
    const users = await User.find({ "subscriptions.daysleft": { $gt: 0 } });

    for (const user of users) {
      for (const subscription of user.subscriptions) {
        if (subscription.daysleft > 0) {
          const updatedDate = subscription.updatedDate;
          const currentDate = new Date();


          // Check if updatedDate is one day before and earlier than currentDate
          if (updatedDate.getDate() < currentDate.getDate()) {

            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0);
            const startTime = new Date(startOfDay);
            startTime.setHours(14, 0, 0, 0); // 5 PM
            const endTime = new Date(startOfDay);
            endTime.setHours(16, 0, 0, 0); // 7 PM
            console.log(currentDate);
            console.log(startTime);
            if (currentDate >= startTime && currentDate <= endTime) {

              // Calculate the amount to add to the wallet for each day
              const amountToAddPerDay = 100;

              // Update the wallet for the current date
              await updateWalletInSubscription(
                user._id,
                amountToAddPerDay,
                new Date(),
                subscription.plan._id
              );

              const daysDifference = Math.floor(
                (currentDate - updatedDate) / (1000 * 60 * 60 * 24)
              );

              // Add previous days' data to the wallet array with 0 amount
              for (let i = 1; i < daysDifference; i++) {
                const previousDate = new Date(updatedDate);
                previousDate.setDate(updatedDate.getDate() + i);
                await updateWalletInSubscription(
                  user._id,
                  0,
                  previousDate,
                  subscription.plan._id
                );
              }


              // Decrease daysleft by 1
              await User.findByIdAndUpdate(
                user._id,
                {
                  $inc: { 'subscriptions.$[elem].daysleft': -1 },
                  $set: { 'subscriptions.$[elem].updatedDate': new Date() },
                },
                {
                  arrayFilters: [{ 'elem._id': subscription._id }],
                }
              );


              console.log(currentDate);
              console.log(startTime);
              console.log("5 to 7");

            } else {
              console.log("not in 5 to 7")
            }
          } else {
            console.log("Current date is higher than or equal to updated date.")
          }
        } else {
          console.log("all subscription has no remaining credits");
        }
      }
    }
  } catch (error) {
    console.log(error);
    console.error("Error in background task:", error);
  }
}


exports.updateUserSubscriptionofparticularPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
    const planIdToUpdate = req.body.planId;
    const walletIdToExtract = req.body.walletIdToExtract
    const updatedAmount = req.body.updatedAmount;
    const dateAdded = new Date(req.body.updatedDateAdded); // Set the date to October 4, 2023

    // Use the $elemMatch projection to find the specific plan object by planId
    const user = await User.findOne(
      {
        _id: userId,
        'subscriptions': {
          $elemMatch: {
            'plan': planIdToUpdate,
          },
        },
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract the specific plan object from the result
    const specificPlan = user.subscriptions.find(
      (subscription) => subscription.plan.equals(planIdToUpdate)
    );

    if (!specificPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Find the wallet object with the matching _id using ObjectId
    const walletToExtract = specificPlan.wallet.find(
      (wallet) => wallet._id.equals(new objectId(walletIdToExtract))
    )

    if (!walletToExtract) {
      return res.status(404).json({ message: 'Wallet object not found' });
    }
    console.log(walletToExtract)

    // Check if daysleft is already zero
    if (specificPlan.daysleft === 0) {
      return res.status(200).json({ message: 'Daysleft is already zero' });
    }

    // Update the "amount" and "dateAdded" fields of walletToExtract
    walletToExtract.amount = updatedAmount;
    walletToExtract.dateAdded = dateAdded;

    // Decrease daysleft by 1, but ensure it doesn't go below 0
    specificPlan.daysleft = Math.max(0, specificPlan.daysleft - 1);

    // Save the updated user document
    await user.save();
    // Include it in the response
    const response = {
      userId: user._id,
      phoneNumber: user.mobile,
      userType: user.userType,
      specificPlan: {
        ...specificPlan.toObject(), // Convert specificPlan to an object
        wallet: [walletToExtract], // Include only the matching wallet object
      },
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




