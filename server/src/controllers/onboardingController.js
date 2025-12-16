import OnboardingApplication from "../models/OnboardingApplication.js";

/* ==========================================================
   GET /api/onboarding/me
   Load or auto-create onboarding draft for current user
========================================================== */
export const getMyOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;

    let app = await OnboardingApplication.findOne({ userId });

    // Auto-create draft (first time)
    if (!app) {
      app = await OnboardingApplication.create({
        userId,
        status: "not_submitted",

        name: {},
        address: {},
        contactInfo: {},
        legalInfo: {},
        visaInfo: {},
        reference: {},
        emergencyContacts: [],

        submittedAt: null,
        feedback: ""
      });
    }

    return res.json(app);
  } catch (err) {
    console.error("getMyOnboarding error:", err);
    return res.status(500).json({ msg: "Server error loading onboarding" });
  }
};

/* ==========================================================
   POST /api/onboarding/me
   Save draft (user editing form)
   Only editable when status === not_submitted OR rejected
========================================================== */
export const saveMyOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body || {};

    let app = await OnboardingApplication.findOne({ userId });
    if (!app) {
      return res.status(404).json({ msg: "Onboarding record not found" });
    }

    // cannot edit after submitting unless HR rejected it
    if (app.status === "pending") {
      return res.status(400).json({ msg: "Cannot edit while waiting for HR review" });
    }
    if (app.status === "approved") {
      return res.status(400).json({ msg: "Onboarding already approved" });
    }

    // safe merge
    const merge = (oldObj, newObj) => {
      if (!newObj || typeof newObj !== "object") return oldObj || {};
      return { ...(oldObj || {}), ...newObj };
    };

    app.name = merge(app.name, updates.name);
    app.address = merge(app.address, updates.address);
    app.contactInfo = merge(app.contactInfo, updates.contactInfo);
    app.legalInfo = merge(app.legalInfo, updates.legalInfo);
    app.visaInfo = merge(app.visaInfo, updates.visaInfo);
    app.reference = merge(app.reference, updates.reference);

    if (Array.isArray(updates.emergencyContacts)) {
      app.emergencyContacts = updates.emergencyContacts;
    }

    await app.save();

    return res.json(app);

  } catch (err) {
    console.error("saveMyOnboarding error:", err);
    return res.status(500).json({ msg: "Server error saving onboarding" });
  }
};

/* ==========================================================
   POST /api/onboarding/submit
   Submit application for HR review
   Allowed when:
      - status = not_submitted
      - status = rejected (resubmit allowed)
========================================================== */
export const submitMyOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;

    let app = await OnboardingApplication.findOne({ userId });
    if (!app) {
      return res.status(404).json({ msg: "Onboarding record not found" });
    }

    if (app.status === "pending") {
      return res.status(400).json({ msg: "Already submitted, waiting for HR review" });
    }
    if (app.status === "approved") {
      return res.status(400).json({ msg: "Onboarding already approved" });
    }

    // HR rejection feedback should clear after new submission
    app.status = "pending";
    app.submittedAt = new Date();
    app.feedback = "";

    await app.save();

    return res.json({
      msg: "Onboarding submitted successfully",
      status: app.status,
      submittedAt: app.submittedAt
    });

  } catch (err) {
    console.error("submitMyOnboarding error:", err);
    return res.status(500).json({ msg: "Server error submitting onboarding" });
  }
};