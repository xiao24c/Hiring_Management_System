import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RegistrationToken from "../models/RegistrationToken.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import VisaStatus from "../models/VisaStatus.js";

const router = express.Router();

// 注册（需HR发放token）
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, token } = req.body;

    const existingToken = await RegistrationToken.findOne({ email, token, used: false });
    if (!existingToken) return res.status(400).json({ message: "Invalid or expired token" });

    if (existingToken.expiresAt < Date.now())
      return res.status(400).json({ message: "Token expired" });

    const user = new User({ username, email, role: "employee" });
    await user.setPassword(password);
    await user.save();

    await OnboardingApplication.findOneAndUpdate(
      { user: user._id },
      { user: user._id, "formData.personalInfo.email": email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await VisaStatus.findOneAndUpdate(
      { user: user._id },
      { user: user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    existingToken.used = true;
    existingToken.usedAt = new Date();
    existingToken.usedBy = user._id;
    await existingToken.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取当前用户
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
