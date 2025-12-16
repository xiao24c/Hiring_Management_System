import User from "../models/User.js";
import VisaStatus from "../models/VisaStatus.js";
import OnboardingApplication from "../models/OnboardingApplication.js";

/* --------------------------------
   Helper：推断当前 active step（F1 only）
-------------------------------- */
const getActiveStep = (visa) => {
  if (visa.optReceipt.status !== "approved") return "optReceipt";
  if (visa.optEAD.status !== "approved") return "optEAD";
  if (visa.i983.status !== "approved") return "i983";
  return "i20";
};

/* --------------------------------
   Helper：返回 allowed actions
-------------------------------- */
const getAllowedActions = (stepStatus) => {
  switch (stepStatus) {
    case "pending":
      return ["preview", "approve", "reject"];
    case "rejected":
    case "not_submitted":
    case "approved":
      return ["notify_user"];
    default:
      return [];
  }
};

/* --------------------------------
   Helper：计算剩余天数
-------------------------------- */
const calcDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const diffMs = new Date(endDate) - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/* ======================================================
   HR Tab: Visa Summary List
   - 同时支持 In Progress / All
   - ✅ 包含 F1 + 非 F1
====================================================== */
export const getVisaSummaryList = async (req, res) => {
  try {
    // 1️⃣ 所有已 approved onboarding 的员工
    const onboardings = await OnboardingApplication.find({
      status: "approved",
    }).lean();

    if (onboardings.length === 0) {
      return res.json([]);
    }

    const userIds = onboardings.map(o => o.userId);

    // 2️⃣ 用户信息
    const users = await User.find({
      _id: { $in: userIds },
    })
      .select("_id username email")
      .lean();

    const userMap = new Map(
      users.map(u => [u._id.toString(), u])
    );

    // 3️⃣ VisaStatus（只有 F1 才有）
    const visas = await VisaStatus.find({
      userId: { $in: userIds },
    }).lean();

    const visaMap = new Map(
      visas.map(v => [v.userId.toString(), v])
    );

    // 4️⃣ 统一构造 summary
    const result = onboardings.map(onboarding => {
      const userId = onboarding.userId.toString();
      const user = userMap.get(userId);
      const visaInfo = onboarding.visaInfo || {};

      const isF1 =
        visaInfo.isCitizenOrPR === false &&
        visaInfo.workAuthorization === "F1";

      const visa = visaMap.get(userId);

      // ===== F1 =====
      if (isF1 && visa) {
        const activeStep = getActiveStep(visa);
        const stepStatus = visa[activeStep]?.status;

        return {
          user,
          isF1: true,

          // visa workflow
          activeStep,
          status: stepStatus,

          // work authorization
          workAuthorization: {
            title: "F1",
            startDate: visaInfo.startDate || null,
            endDate: visaInfo.endDate || null,
          },
          daysRemaining: calcDaysRemaining(visaInfo.endDate),
        };
      }

      // ===== 非 F1 =====
      return {
        user,
        isF1: false,

        activeStep: null,
        status: "approved", // 对 HR 来说已完成

        workAuthorization: {
          title: visaInfo.isCitizenOrPR
            ? visaInfo.status || "Citizen / PR"
            : visaInfo.workAuthorization || "Other",
          startDate: visaInfo.startDate || null,
          endDate: visaInfo.endDate || null,
        },
        daysRemaining: calcDaysRemaining(visaInfo.endDate),
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getVisaSummaryList error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================================================
   HR Tab: Visa Detail Page (F1 only)
====================================================== */
export const getVisaDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const visa = await VisaStatus.findOne({ userId }).lean();
    const user = await User.findById(userId).lean();

    if (!visa) {
      return res.json({
        msg: "No visa record found (probably non-F1).",
        visa: null,
      });
    }

    const activeStep = getActiveStep(visa);
    const activeStepStatus = visa[activeStep].status;

    res.json({
      user,
      visa,
      activeStep,
      activeStepStatus,
      allowedActions: getAllowedActions(activeStepStatus),
      activeStepFile: visa[activeStep].fileUrl || null,
    });
  } catch (err) {
    console.error("getVisaDetail error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ======================================================
   HR Action: advanceVisaStatus
====================================================== */
export const advanceVisaStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, feedback } = req.body;

    const visa = await VisaStatus.findOne({ userId });
    if (!visa) {
      return res.status(404).json({ msg: "Visa record not found" });
    }

    const activeStep = getActiveStep(visa);
    const step = visa[activeStep];

    if (action === "approve") {
      if (step.status !== "pending") {
        return res.status(400).json({ msg: "Cannot approve this step" });
      }
      step.status = "approved";
      step.feedback = "";
      await visa.save();

      return res.json({
        msg: `Step ${activeStep} approved`,
        nextStep: getActiveStep(visa),
      });
    }

    if (action === "reject") {
      if (step.status !== "pending") {
        return res.status(400).json({ msg: "Cannot reject this step" });
      }
      step.status = "rejected";
      step.feedback = feedback ?? "";
      await visa.save();

      return res.json({
        msg: `Step ${activeStep} rejected`,
        feedback: step.feedback,
      });
    }

    if (action === "notify_user") {
      console.log(`📧 Email sent to user ${userId} for step ${activeStep}`);
      return res.json({
        msg: "Notification sent to employee",
        step: activeStep,
      });
    }

    return res.status(400).json({ msg: "Unknown action" });
  } catch (err) {
    console.error("advanceVisaStatus error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};