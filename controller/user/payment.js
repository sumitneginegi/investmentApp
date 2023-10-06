const razorpay = require("razorpay");
const crypto = require("crypto");
const uuid = require("uuid");
const id = uuid.v4();
const userModel = require("../../model/user");
const paymentModel = require("../../model/payment");
const planModel = require("../../model/plans");
const mongoose = require("mongoose"); // Import the mongoose library

const ObjectId = mongoose.Types.ObjectId;


const reffralCode = async () => {
  var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let OTP = "";
  for (let i = 0; i < 9; i++) {
    OTP += digits[Math.floor(Math.random() * 36)];
  }
  return OTP;
}


const generateUniqueOrderId = async () => {
  // Implement your logic to generate a unique order ID
  // For example, you can use your existing `reffralCode` function
  // and ensure that the generated order ID doesn't already exist in your database
  let orderId;
  do {
    orderId = await reffralCode();
  } while (await paymentModel.findOne({ razorpayOrderId: orderId }));
  return orderId;
};


exports.createPayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Find the user by their ID
    const user = await userModel.findById(userId).populate("subscriptions.plan");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the provided planId is valid
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if the user has a subscription for the specified plan
    const subscription = user.subscriptions.find((sub) =>
      sub.plan._id.equals(planId)
    );

    if (!subscription) {
      return res.status(400).json({
        message: "User needs to subscribe to this plan first",
      });
    }

    // Check if the subscription payment_status is "false"
    if (subscription.payment_status === "false") {
      // Calculate the total amount
      const planPrice = plan.price;

      // Generate a unique order ID
      const orderId = await generateUniqueOrderId();

      // Capture the payment status from your payment gateway
      // For example, you can check the payment status in your Razorpay webhook or callback
      const paymentStatus = "true"; // Change this based on your actual payment status

      // Create a new payment instance using the Payment model
      const newPayment = new paymentModel({
        userId,
        planId,
        amount: planPrice,
        razorpayOrderId: orderId,
        status: paymentStatus,
      });

      // Save the new payment to the database
      const savedPayment = await newPayment.save();

      // Update the subscription's payment_status to "true"
      subscription.payment_status = paymentStatus;

      // Update the subscription's date to the current date
      subscription.date = new Date();
      
      subscription.updatedDate = new Date();

      // Update the subscription's daysleft to 30
      subscription.daysleft = 30;

      // Save the updated user document
      await user.save();

      return res.status(201).json({ savedPayment: savedPayment });
    } else {
      return res.status(400).json({
        message: "Subscription already marked as successful",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create payment" });
  }
};




// exports.GetAllPayments = async (req, res) => {
//   try {
//     const Data = await paymentModel.find()

//     if (!Data || Data.length==0) {
//       return res.status(500).json({
//         message: "payment data not present",
//       });
//     }
//     return res.status(200).json({ details: Data });
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }
// };


// exports.GetAllPaymentsById = async (req, res) => {
//   try {
//     const Data = await paymentModel.findById({_id:req.params.id})
//     if (!Data || Data.length==0) {
//       return res.status(500).json({
//         message: "payment data not present",
//       });
//     }
//     return res.status(200).json({ details: Data })
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }
// };


// exports.GetAllPaymentsByEmployerId = async (req, res) => {
//   try {
//     const employerId = req.params.id;

//     // Use .populate() to replace bookingId reference with actual data from bookingByEmployer model
//     const payments = await paymentModel.find({ employerId })
//       .populate("employerId")

//     if (!payments || payments.length === 0) {
//       return res.status(404).json({
//         message: "No payments found for the specified employer ID",
//       });
//     }

//     return res.status(200).json({ details: payments });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// exports.deletePayment = async (req, res) => {
//   try {
//     const { Payment } = req.params

//     const deletedPayment = await paymentModel.findByIdAndRemove(Payment);

//     if (!deletedPayment) {
//       return res.status(404).json({ error: 'Payment not found.' });
//     }

//     res.json({ message: 'Payment deleted successfully.' })
//   } catch (error) {
//     console.error('Error deleting notification:', error);
//     res.status(500).json({ error: 'An error occurred while deleting the Payment.' });
//   }
// }




