/****************************************************
 * seedSummary.js — accurate summary for A2-clean structure
 ****************************************************/

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import User from "../src/models/User.js";
import OnboardingApplication from "../src/models/OnboardingApplication.js";
import VisaStatus from "../src/models/VisaStatus.js";
import RegistrationToken from "../src/models/RegistrationToken.js";

/* -------------------------
   Load .env
-------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Loaded MONGODB_URI =", process.env.MONGODB_URI);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\n=== Connected to MongoDB ===\n");

    /****************************************************
     * 1. USER ROLE SUMMARY
     ****************************************************/
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    console.log("===== USER ROLE SUMMARY =====");
    console.table(
      userRoles.map((r) => ({ role: r._id, count: r.count }))
    );

    /****************************************************
     * 2. RAW ONBOARDING COUNTS
     ****************************************************/
    const onboardAgg = await OnboardingApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    console.log("\n===== RAW ONBOARDING STATUS COUNTS =====");
    console.table(
      onboardAgg.map((o) => ({ status: o._id, count: o.count }))
    );

    /****************************************************
     * 3. BUSINESS CATEGORIES A / B / C / D (FINAL)
     ****************************************************/
    const employees = await User.find({ role: "employee" }).lean();
    const onboardingDocs = await OnboardingApplication.find({}).lean();
    const tokens = await RegistrationToken.find({}).lean();

    // A / B / C 全部从 onboardingDocs 来（因为注册后必有 onboarding）
    let A = 0, B = 0, C = 0;

    for (const app of onboardingDocs) {
      const status = app.status;
      const visa = app.visaInfo || {};

      if (["not_submitted", "pending", "rejected"].includes(status)) {
        A++;
      } else if (status === "approved") {
        if (visa.workAuthorization === "F1") B++;
        else C++;
      }
    }

    // D：未注册（token-only），包含有效 + 过期
    const now = new Date();
    const tokenOnly = tokens.filter(t => t.used === false);
    const D_valid = tokenOnly.filter(t => t.expiresAt && t.expiresAt > now).length;
    const D_expired = tokenOnly.filter(t => !t.expiresAt || t.expiresAt <= now).length;
    const D = tokenOnly.length;

    console.log("\n===== EMPLOYEE CATEGORY SUMMARY =====");
    console.table([
      { category: "A: Test users (not_submitted / pending / rejected)", count: A },
      { category: "B: F1 approved users (12 states)", count: B },
      { category: "C: Non-F1 approved users", count: C },
      { category: "D: Token-only users (NOT registered)", count: D },
      { category: "TOTAL registered employees", count: employees.length }
    ]);

    console.log("\n===== TOKEN SUMMARY =====");
    console.table([
      { category: "Used tokens (registered)", count: tokens.filter(t => t.used === true).length },
      { category: "Unused tokens (valid)", count: D_valid },
      { category: "Unused tokens (expired)", count: D_expired },
      { category: "TOTAL tokens", count: tokens.length }
    ]);

    /****************************************************
     * 4. VISA STEP SUMMARY (F1 ONLY)
     ****************************************************/
    const visaDocs = await VisaStatus.find({}).lean();

    function countStep(records, stepName) {
      const result = { pending: 0, rejected: 0, approved: 0, not_submitted: 0 };
      for (const r of records) {
        const status = r[stepName]?.status ?? "not_submitted";
        result[status]++;
      }
      return result;
    }

    console.log("\n===== VISA STEP SUMMARY (F1 ONLY) =====");

    console.log("\n--- OPT RECEIPT ---");
    console.table(countStep(visaDocs, "optReceipt"));

    console.log("\n--- OPT EAD ---");
    console.table(countStep(visaDocs, "optEAD"));

    console.log("\n--- I-983 ---");
    console.table(countStep(visaDocs, "i983"));

    console.log("\n--- I-20 ---");
    console.table(countStep(visaDocs, "i20"));

    console.log("\n===== DEBUG: Employees with NO onboarding record =====");

    for (const emp of employees) {
      if (!onboardUserIds.has(emp._id.toString())) {
        console.log("❌ Missing onboarding:", {
          username: emp.username,
          email: emp.email,
          userId: emp._id.toString()
        });
      }
    }

    console.log("\n🎉 Summary complete!");
    process.exit(0);

  } catch (err) {
    console.error("Summary error:", err);
    process.exit(1);
  }
}

run();