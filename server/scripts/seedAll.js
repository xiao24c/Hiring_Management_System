/*******************************************************
 * seedAll.js — FULL 26 users, realistic HR system
 *******************************************************/

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../src/models/User.js";
import OnboardingApplication from "../src/models/OnboardingApplication.js";
import VisaStatus from "../src/models/VisaStatus.js";
import RegistrationToken from "../src/models/RegistrationToken.js";

/* ---------------- ENV ---------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

/* ---------------- Utils ---------------- */

const hashPassword = (pwd) => bcrypt.hash(pwd, 10);

const FILE_BASE_URL =
  process.env.SEED_FILE_BASE_URL || "http://localhost:5050/uploads";

const sampleFiles = {
  profile: `${FILE_BASE_URL}/profile.png`,
  license: `${FILE_BASE_URL}/license.pdf`,
  optReceipt: `${FILE_BASE_URL}/opt_receipt.pdf`,
  optEAD: `${FILE_BASE_URL}/opt_ead.pdf`,
  i983: `${FILE_BASE_URL}/i983.pdf`,
  i20: `${FILE_BASE_URL}/i20.pdf`,
};

async function createUser(username, email, role = "employee") {
  return User.create({
    username,
    email,
    role,
    passwordHash: await hashPassword("Test123!")
  });
}

function genToken(email, { used = false, expired = false } = {}) {
  const now = Date.now();
  return {
    email,
    token: `token_${email}_${Math.random().toString(36).slice(2)}`,
    used,
    expiresAt: expired
      ? new Date(now - 3 * 60 * 60 * 1000)
      : new Date(now + 3 * 60 * 60 * 1000)
  };
}

async function createTokenForUser(email, userId) {
  const tokenData = genToken(email, { used: true });
  return RegistrationToken.create({
    ...tokenData,
    userId
  });
}

async function createOnboarding(userId, status, extra = {}) {
  return OnboardingApplication.create({
    userId,
    status,
    feedback: extra.feedback ?? "",
    submittedAt: ["pending", "rejected", "approved"].includes(status)
      ? new Date()
      : null,
    name: {
      firstName: extra.firstName ?? "",
      lastName: extra.lastName ?? "Test"
    },
    contactInfo: {
      cellPhone: "123-456-7890"
    },
    visaInfo: extra.visaInfo ?? {},
    profilePictureUrl: extra.profilePictureUrl ?? "",
    driverLicenseUrl: extra.driverLicenseUrl ?? "",
    emergencyContacts: []
  });
}

async function createVisa(userId, step) {
  return VisaStatus.create({
    userId,
    optReceipt: {
      status: step.receipt ?? "not_submitted",
      fileUrl: step.receipt ? sampleFiles.optReceipt : ""
    },
    optEAD: {
      status: step.ead ?? "not_submitted",
      fileUrl: step.ead ? sampleFiles.optEAD : ""
    },
    i983: {
      status: step.i983 ?? "not_submitted",
      fileUrl: step.i983 ? sampleFiles.i983 : ""
    },
    i20: {
      status: step.i20 ?? "not_submitted",
      fileUrl: step.i20 ? sampleFiles.i20 : ""
    }
  });
}

/* ---------------- Seed ---------------- */

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase();

  console.log("🌱 Seeding FULL HR system...");

  /* ========== HR (2) ========== */
  await createUser("adminHR", "hr1@test.com", "hr");
  await createUser("reviewHR", "hr2@test.com", "hr");

  /* ========== D 类：未注册 token（1） ========== */
  await RegistrationToken.create(genToken("never@test.com"));

  /* 过期未注册 token（2） */
  await RegistrationToken.create(genToken("expired1@test.com", { expired: true }));
  await RegistrationToken.create(genToken("expired2@test.com", { expired: true }));

  /* ========== A 类：Onboarding 测试（5） ========== */
  const A = [
    { u: "not_emp", s: "not_submitted" },
    { u: "pend_emp1", s: "pending" },
    { u: "pend_emp2", s: "pending" },
    { u: "pend_emp3", s: "pending" },
    { u: "rej_emp", s: "rejected", fb: "Missing documents" }
  ];

  for (const a of A) {
    const user = await createUser(a.u, `${a.u}@test.com`);
    await createTokenForUser(`${a.u}@test.com`, user._id);
    await createOnboarding(user._id, a.s, {
      firstName: a.u,
      feedback: a.fb,
      profilePictureUrl: sampleFiles.profile,
      driverLicenseUrl: sampleFiles.license
    });
  }

  /* ========== C 类：Non-F1 Approved（6） ========== */
  const C = [
    { label: "citizen", visa: { isCitizenOrPR: true, status: "Citizen" } },
    { label: "greencard", visa: { isCitizenOrPR: true, status: "Green Card" } },
    { label: "h1b", visa: { isCitizenOrPR: false, workAuthorization: "H1B" } },
    { label: "l2", visa: { isCitizenOrPR: false, workAuthorization: "L2" } },
    { label: "h4", visa: { isCitizenOrPR: false, workAuthorization: "H4" } },
    { label: "other", visa: { isCitizenOrPR: false, workAuthorization: "Other", otherTitle: "TN" } }
  ];

  for (const c of C) {
    const user = await createUser(`emp_${c.label}`, `${c.label}@test.com`);
    await createTokenForUser(`${c.label}@test.com`, user._id);
    await createOnboarding(user._id, "approved", {
      firstName: c.label,
      visaInfo: c.visa,
      profilePictureUrl: sampleFiles.profile,
      driverLicenseUrl: sampleFiles.license
    });
  }

  /* ========== B 类：F1 全流程（12） ========== */
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  const steps = [
    { receipt: "pending" },
    { receipt: "rejected" },
    { receipt: "approved" },
    { receipt: "approved", ead: "pending" },
    { receipt: "approved", ead: "rejected" },
    { receipt: "approved", ead: "approved" },
    { receipt: "approved", ead: "approved", i983: "pending" },
    { receipt: "approved", ead: "approved", i983: "rejected" },
    { receipt: "approved", ead: "approved", i983: "approved" },
    { receipt: "approved", ead: "approved", i983: "approved", i20: "pending" },
    { receipt: "approved", ead: "approved", i983: "approved", i20: "rejected" },
    { receipt: "approved", ead: "approved", i983: "approved", i20: "approved" }
  ];

  let i = 1;
  for (const st of steps) {
    const user = await createUser(`f1_user${i}`, `f1_user${i}@test.com`);
    await createTokenForUser(`f1_user${i}@test.com`, user._id);
    await createOnboarding(user._id, "approved", {
      firstName: `F1_${i}`,
      visaInfo: {
        isCitizenOrPR: false,
        workAuthorization: "F1",
        startDate: now,
        endDate: nextYear,
        optReceiptUrl: sampleFiles.optReceipt
      }
    });
    await createVisa(user._id, st);
    i++;
  }

  console.log("🎉 DONE! 26 users seeded perfectly.");
  process.exit(0);
}

run();
