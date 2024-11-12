const express = require("express");
const router = express.Router();
const { User, Counter } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const generateUserId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "userId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true } 
  );

  return counter.sequenceValue.toString();
};

const userController = {
  createUser: async (req, res) => {
    try {
      const { name, password, score, phone, address, email, role } = req.body;

      
      const userEmail = await User.findOne({ email: email });
      if (userEmail) {
        return res.status(400).json({ error: "email is already registered" });
      }

      const userId = await generateUserId();
      const hashedTechnicianPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        userId,
        name,
        score,
        phone,
        address,
        email,
        password: hashedTechnicianPassword,
        role: role || "user", 
      });

      await newUser.save();

      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },
  userSignin: async (req, res) => {
    const { email, password } = req.body;

    try {
      if (!email) {
        return res.status(401).json({ error: "please enter credentials" });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = userController;
