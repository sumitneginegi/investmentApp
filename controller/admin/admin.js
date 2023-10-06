const OTP = require("../../config/OTP-Generate");
const User = require("../../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');
// const Notification = require('../models/notification');
const io = require('socket.io')(); // Import the Socket.io instance (make sure it's the same instance as in your main server file)


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



exports.registrationthroughAdmin = async (req, res) => {
  try {

    const data = {
      employerName: req.body.employerName,
      active: req.body.active,
      gender: req.body.gender,
      email: req.body.email,
      mobile: req.body.mobile,
      createdAt: req.body.createdAt,
      state: req.body.state,
      city: req.body.city,
      GST_Number: req.body.GST_Number,
      registration_Number: req.body.registration_Number,
      pinCode: req.body.pinCode,
      aadharCard: req.body.aadharCard, // Updated field
      panCard: req.body.panCard, // Updated field,
      siteLocation: req.body.siteLocation,
    }

    var user = await User.findOne({ mobile: data.mobile, userType: "employer" })

    if (!user) {
      req.body.userType = "employer"


      const userCreate = await User.create({
        data,
        wallet: 100,
        ...req.body
      })

      let obj = {
        id: userCreate._id,
        mobile: userCreate.mobile,
        employerName: userCreate.employerName,
        active: userCreate.active,
        gender: userCreate.gender,
        email: userCreate.email,
        mobile: userCreate.mobile,
        createdAt: userCreate.createdAt,
        state: userCreate.state,
        city: userCreate.city,
        GST_Number: userCreate.GST_Number,
        registration_Number: userCreate.registration_Number,
        pinCode: userCreate.pinCode,
        aadharCard: userCreate.aadharCard,
        panCard: userCreate.panCard,
        siteLocation: userCreate.siteLocation,
      }

      res.status(201).send({
        status: 200,
        message: "Registered successfully ",
        data: obj
      })
    } else {
      return res.json({ status: 409, message: "Already Exit" });
    }

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" });
  }
}