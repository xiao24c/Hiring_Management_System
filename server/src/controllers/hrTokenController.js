import crypto from "crypto";
import RegistrationToken from "../models/RegistrationToken.js";
import User from "../models/User.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * POST /api/hr/tokens
 * HR 生成注册邀请码
 * body: { email }
 */
export const generateRegistrationToken = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // 检查 email 是否已被注册
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.json({
        msg: "This email is already registered.",
        alreadyRegistered: true
      });
    }

    // 检查是否已有未使用的 token（未过期）
    const existingToken = await RegistrationToken.findOne({
      email: normalizedEmail,
      used: false
    });
    if (existingToken && new Date(existingToken.expiresAt) > new Date()) {
      const registerLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?token=${existingToken.token}`;
      await sendEmail({
        to: email,
        subject: "Your registration link",
        text: `Use the following link to register (valid for 3 hours): ${registerLink}`,
        html: `<p>Use the following link to register (valid for 3 hours):</p><p><a href="${registerLink}">${registerLink}</a></p>`
      });
      return res.json({
        msg: "A valid token already exists. Link resent.",
        token: existingToken.token,
        expiresAt: existingToken.expiresAt,
        registerLink,
        alreadySent: true,
        resent: true
      });
    }

    // 生成唯一 Token
    const token = crypto.randomBytes(16).toString("hex");

    // 默认过期时间 = 3 小时
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const newToken = await RegistrationToken.create({
      email: normalizedEmail,
      token,
      expiresAt
    });

    // 发送邮件（如果配置了 SMTP）
    const registerLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?token=${token}`;
    await sendEmail({
      to: normalizedEmail,
      subject: "Your registration link",
      text: `Use the following link to register (valid for 3 hours): ${registerLink}`,
      html: `<p>Use the following link to register (valid for 3 hours):</p><p><a href="${registerLink}">${registerLink}</a></p>`
    });

    return res.json({
      msg: "Registration token created",
      email: normalizedEmail,
      token,
      expiresAt,
      registerLink
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
    const tokens = await RegistrationToken.find().sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      tokens.map(async (t) => {
        let onboardingStatus = null;
        let name = null;

        if (t.userId) {
          const onboarding = await OnboardingApplication.findOne({ userId: t.userId }).lean();
          onboardingStatus = onboarding?.status || null;
          const n = onboarding?.name || {};
          name = [n.firstName, n.lastName].filter(Boolean).join(" ").trim() || null;
        }

        return {
          ...t,
          registerLink: `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?token=${t.token}`,
          onboardingStatus,
          name
        };
      })
    );

    return res.json(enriched);
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
