import crypto from "crypto";
import RegistrationToken from "../models/RegistrationToken.js";
import User from "../models/User.js";

/**
 * POST /api/hr/tokens
 * HR 生成注册邀请码
 * body: { email }
 */
export const generateRegistrationToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // 检查 email 是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "This email is already registered." });
    }

    // 检查是否已有未使用的 token
    const existingToken = await RegistrationToken.findOne({ email, used: false });
    if (existingToken) {
      return res.json({
        msg: "An unused token already exists for this email.",
        token: existingToken.token,
        expiresAt: existingToken.expiresAt
      });
    }

    // 生成唯一 Token
    const token = crypto.randomBytes(16).toString("hex");

    // 默认过期时间 = 7 天
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newToken = await RegistrationToken.create({
      email,
      token,
      expiresAt
    });

    return res.json({
      msg: "Registration token created",
      email,
      token,
      expiresAt
    });

  } catch (err) {
    console.error("generateRegistrationToken error:", err);
    return res.status(500).json({ msg: "Server error generating registration token" });
  }
};



/**
 * GET /api/hr/tokens
 * HR 查看所有 token
 */
export const listRegistrationTokens = async (req, res) => {
  try {
    const tokens = await RegistrationToken.find().sort({ createdAt: -1 });
    return res.json(tokens);
  } catch (err) {
    console.error("listRegistrationTokens error:", err);
    return res.status(500).json({ msg: "Server error loading tokens" });
  }
};



/**
 * DELETE /api/hr/tokens/:tokenId
 * HR 删除 token（用于清理）
 */
export const deleteRegistrationToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const t = await RegistrationToken.findByIdAndDelete(tokenId);

    if (!t) {
      return res.status(404).json({ msg: "Token not found" });
    }

    return res.json({ msg: "Token deleted" });

  } catch (err) {
    console.error("deleteRegistrationToken error:", err);
    return res.status(500).json({ msg: "Server error deleting token" });
  }
};