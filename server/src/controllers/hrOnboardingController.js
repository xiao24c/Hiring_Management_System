// server/src/controllers/hrOnboardingController.js

import OnboardingApplication from "../models/OnboardingApplication.js";

/* ==========================================================
   1. HR — Get all onboarding applications (grouped)
   ========================================================== */
export const getAllOnboardingApplications = async (req, res) => {
  try {
    const list = await OnboardingApplication.find().populate("userId");

    const grouped = {
      pending: [],
      approved: [],
      rejected: []
    };

    for (const app of list) {
      if (app.status === "pending") grouped.pending.push(app);
      else if (app.status === "approved") grouped.approved.push(app);
      else if (app.status === "rejected") grouped.rejected.push(app);
    }

    return res.json(grouped);

  } catch (err) {
    console.error("getAllOnboardingApplications error:", err);
    return res.status(500).json({ msg: "Server error while loading onboarding list" });
  }
};


/* ==========================================================
   2. HR — Get detail of a specific onboarding record
   ========================================================== */
export const getOnboardingDetail = async (req, res) => {
  try {
    const { onboardingId } = req.params;

    const app = await OnboardingApplication
      .findById(onboardingId)
      .populate("userId");

    if (!app) {
      return res.status(404).json({ msg: "Onboarding application not found" });
    }

    return res.json(app);

  } catch (err) {
    console.error("getOnboardingDetail error:", err);
    return res.status(500).json({ msg: "Server error fetching onboarding detail" });
  }
};


/* ==========================================================
   3. HR — Approve onboarding
   ========================================================== */
export const approveOnboarding = async (req, res) => {
  try {
    const { onboardingId } = req.params;

    const app = await OnboardingApplication.findById(onboardingId);
    if (!app) {
      return res.status(404).json({ msg: "Onboarding application not found" });
    }

    // Only pending apps can be approved
    if (app.status !== "pending") {
      return res.status(400).json({
        msg: `Cannot approve. Current status is '${app.status}'.`
      });
    }

    app.status = "approved";
    app.feedback = ""; // clear any old feedback
    app.updatedAt = new Date();
    await app.save();

    res.json({
      msg: "Onboarding approved.",
      onboardingId: app._id
    });

  } catch (err) {
    console.error("approveOnboarding error:", err);
    return res.status(500).json({ msg: "Server error while approving onboarding" });
  }
};


/* ==========================================================
   4. HR — Reject onboarding (feedback optional)
   ========================================================== */
export const rejectOnboarding = async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { feedback = "" } = req.body || {};

    const app = await OnboardingApplication.findById(onboardingId).populate("userId");

    if (!app) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (app.status !== "pending") {
      return res.status(400).json({
        msg: "Only pending applications can be rejected"
      });
    }

    app.status = "rejected";
    app.feedback = feedback;
    app.updatedAt = new Date();

    await app.save();

    return res.json({
      msg: "Onboarding rejected successfully",
      application: app
    });

  } catch (err) {
    console.error("rejectOnboarding error:", err);
    return res.status(500).json({ msg: "Server error rejecting onboarding" });
  }
};