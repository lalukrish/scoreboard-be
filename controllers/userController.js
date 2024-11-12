const express = require("express");
const router = express.Router();
const { User, Counter } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateUserId = async () => {
  const reset = false;

  if (reset) {
    await Counter.findOneAndUpdate(
      { name: "userId" },
      { $set: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
  }

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

      const user = await User.findOne({
        email: email,
      });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
        },
        "sdfsdf2SD34NZXR2stesDsdfasrWWAr",
        { expiresIn: "1h" }
      );
      return res.status(200).json({
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateUserScore: async (req, res) => {
    try {
      const { id } = req.params;
      const { score } = req.body;
      if (typeof score !== "number" || score < 0) {
        return res.status(400).json({ error: "Invalid score value" });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { score },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "User score updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user score:", error);
      res.status(500).json({ error: "Failed to update user score" });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const searchQuery = req.query.search || "";
      const skip = (page - 1) * limit;

      const searchCriteria = {
        role: "user",
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { userId: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const users = await User.find(searchCriteria)
        .sort({ score: -1, name: 1 })
        .skip(skip)
        .limit(limit);

      const totalUsers = await User.countDocuments(searchCriteria);

      if (users.length === 0) {
        return res.status(200).json({
          users: [],
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          limit,
        });
      }

      res.status(200).json({
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      });
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error, try again later" });
    }
  },
  getSingleUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  },
};

module.exports = userController;
