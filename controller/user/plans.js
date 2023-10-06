const planModel = require('../../model/plans'); // Update the path to your planModel file if needed
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


// Create a new plan
exports.createPlan = async (req, res) => {
    try {
        const { planName, price } = req.body;

        // Check the current count of document

        // Check if a plan with the same planName and price already exists
        const existingPlan = await planModel.findOne({ planName, price });

        if (existingPlan) {
            return res.status(400).json({ message: "A plan with the same name and price already exists." });
        }

        const planCount = await planModel.countDocuments();
        console.log(planCount);

        if (planCount >= 3) {
            return res.status(400).json({ message: "You cannot create more than three plans." });
        }


        const newPlan = new planModel({ planName, price });
        const savedPlan = await newPlan.save();

        return res.status(201).json(savedPlan);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



// Get all plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await planModel.find();

        if (!plans || plans.length == 0) {
            return res.status(400).json({ message: "A plan does not exist" });
        }
        return res.status(200).send({ msg: "success", plans: plans });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific plan by ID
exports.getPlanById = async (req, res) => {
    try {
        const plan = await planModel.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        return res.status(200).send({ msg: "success", plan: plan });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a specific plan by ID
exports.updatePlan = async (req, res) => {
    try {
        const updatedPlan = await planModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        return res.status(200).send({ msg: "success", updatedPlan: updatedPlan });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete a specific plan by ID
exports.deletePlan = async (req, res) => {
    try {
        const deletedPlan = await planModel.findByIdAndRemove(req.params.id);
        if (!deletedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        return res.status(204).end(); // 204 No Content
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};




exports.subscribeToPlan = async (req, res) => {
    try {
        const userId = req.body.userId; // Assuming you pass the user's ID in the request body
        const planId = req.params.id; // Assuming you pass the plan's ID as a route parameter

        // Check if the user and plan exist
        const user = await User.findById(userId).populate("subscriptions.plan");
        const plan = await planModel.findById(planId);

        if (!user || !plan) {
            return res.status(404).json({ message: 'User or Plan not found' });
        }

        // Check if the user is already subscribed to the plan
        const isAlreadySubscribed = user.subscriptions.some(subscription => subscription.plan._id.equals(plan._id));

        if (isAlreadySubscribed) {
            return res.status(400).json({ message: 'User is already subscribed to this plan' });
        }

        // Check if the user has already subscribed to three plans
        if (user.subscriptions.length >= 3) {
            return res.status(400).json({ message: 'User has already subscribed to three plans' });
        }

        // Add the plan to the user's subscriptions
        user.subscriptions.push({
            plan: plan._id,
            payment_status: false // You can set this to 'true' when payment is received
        });

        await user.save();

        return res.status(200).json({ message: 'User subscribed to the plan successfully', user: user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
