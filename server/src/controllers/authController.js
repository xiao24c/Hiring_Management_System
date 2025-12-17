import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import RegistrationToken from "../models/RegistrationToken.js";

/* ------------------------------
   REGISTER (with token validation)
------------------------------ */
export const registerUser = async (req, res) => {
  try {
    const { username, password, token } = req.body;

    if (!username || !password || !token) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // validate registration token
    const tokenDoc = await RegistrationToken.findOne({ token });
    if (!tokenDoc) {
      return res.status(400).json({ msg: "Invalid or unknown token" });
    }
    if (tokenDoc.used) {
      return res.status(400).json({ msg: "This token was already used" });
    }
    if (new Date(tokenDoc.expiresAt) < new Date()) {
      return res.status(400).json({ msg: "Token expired" });
    }

    const email = tokenDoc.email;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // check username unique
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      username,
      passwordHash: hashed,
      role: "employee"
    });

    tokenDoc.used = true;
    tokenDoc.userId = user._id;
    await tokenDoc.save();

    // ⭐ 注册立即创建空的 Onboarding Application
    await OnboardingApplication.create({
      userId: user._id,
      status: "not_submitted", // 初始状态
      feedback: "",
      // 所有字段给空对象即可，前端自动填充
      name: {},
      legalInfo: {},
      address: {},
      contactInfo: {},
      reference: {},
      emergencyContacts: [],
      visaInfo: {},
      profilePictureUrl: "",
      driverLicenseUrl: ""
    });

    res.json({ msg: "User registered", userId: user._id });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------
   VALIDATE TOKEN (preflight for register page)
------------------------------ */
export const validateRegistrationToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ msg: "Token is required" });
    }

    const tokenDoc = await RegistrationToken.findOne({ token });
    if (!tokenDoc) {
      return res.status(404).json({ msg: "Token not found" });
    }
    if (tokenDoc.used) {
      return res.status(400).json({ msg: "Token already used" });
    }
    if (new Date(tokenDoc.expiresAt) < new Date()) {
      return res.status(400).json({ msg: "Token expired" });
    }

    return res.json({
      email: tokenDoc.email,
      expiresAt: tokenDoc.expiresAt
    });
  } catch (err) {
    console.error("validateRegistrationToken error:", err);
    res.status(500).json({ msg: "Server error validating token" });
  }
};

/* ------------------------------
   LOGIN
------------------------------ */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Missing credentials" });
    }

    // find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // sign JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ msg: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------
   ME (auth required)
------------------------------ */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 查 onboarding 状态
    const onboarding = await OnboardingApplication.findOne({ userId }).lean();

    // onboardingStatus 可能为 null → 视为 not_submitted
    const onboardingStatus = onboarding?.status || "not_submitted";

    // 返回用户基础数据 + onboarding 状态
    res.json({
      ...user,
      onboardingStatus,
      visaInfo: user.visaInfo || {},
    });

  } catch (err) {
    console.error("Get /me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
