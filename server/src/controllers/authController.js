import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OnboardingApplication from "../models/OnboardingApplication.js";

/* ------------------------------
   REGISTER (with token validation)
------------------------------ */
export const registerUser = async (req, res) => {
  try {
    const { email, username, password, token } = req.body;

    if (!email || !username || !password || !token) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // check email unique
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
      visaInfo: {}
    });

    res.json({ msg: "User registered", userId: user._id });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------
   LOGIN
------------------------------ */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("LOGIN BODY =", req.body);

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