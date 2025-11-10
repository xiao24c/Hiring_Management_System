import express from "express";
import crypto from "crypto";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { sendRegistrationEmail, sendEmail } from "../utils/emailService.js";

const router = express.Router();

const VISA_FLOW = [
  { type: "opt_receipt", label: "OPT Receipt" },
  { type: "opt_ead", label: "OPT EAD" },
  { type: "i_983", label: "Form I-983" },
  { type: "i_20", label: "I-20" }
];

const buildRegex = (value) => new RegExp(value, "i");

const getPersonalInfoSource = (user) =>
  user.profile?.personalInfo || user.onboarding?.formData?.personalInfo || {};

const getEmploymentSource = (user) =>
  user.profile?.employment || user.onboarding?.formData?.employment || {};

const getLegalName = (user) => {
  const info = getPersonalInfoSource(user);
  if (!info.firstName && !info.lastName) return user.username;
  return [info.firstName, info.middleName, info.lastName].filter(Boolean).join(" ");
};

const getDocuments = (user) => (Array.isArray(user.documents) ? user.documents : []);

const getDocumentByType = (user, type) =>
  getDocuments(user).find((doc) => doc.type === type);

const deriveVisaProgress = (user) => {
  const employment = getEmploymentSource(user);
  const requiresOpt = employment?.workAuthorization === "f1_opt";
  if (!requiresOpt) {
    return {
      requiresOpt: false,
      currentStep: "not_applicable",
      completed: true,
      documents: []
    };
  }

  const documents = VISA_FLOW.map((item) => ({
    label: item.label,
    type: item.type,
    document: getDocumentByType(user, item.type)
  }));

  for (let i = 0; i < documents.length; i++) {
    const entry = documents[i];
    if (!entry.document) {
      return {
        requiresOpt: true,
        currentStep: entry.type,
        completed: false,
        nextStep: `Employee must upload ${entry.label}`,
        action: "notify",
        pendingDocument: null,
        documents
      };
    }

    if (entry.document.status === "pending") {
      return {
        requiresOpt: true,
        currentStep: entry.type,
        completed: false,
        nextStep: `Waiting for HR to review ${entry.label}`,
        action: "review",
        pendingDocument: entry.document,
        documents
      };
    }

    if (entry.document.status === "rejected") {
      return {
        requiresOpt: true,
        currentStep: entry.type,
        completed: false,
        nextStep: entry.document.feedback || `${entry.label} was rejected. Employee must resubmit.`,
        action: "notify",
        pendingDocument: entry.document,
        documents
      };
    }
  }

  return {
    requiresOpt: true,
    currentStep: "completed",
    completed: true,
    nextStep: "All documents have been approved.",
    action: null,
    pendingDocument: null,
    documents
  };
};

const computeDaysRemaining = (user) => {
  const endDate =
    user.profile?.employment?.endDate ||
    user.onboarding?.formData?.employment?.endDate;
  if (!endDate) return null;
  const diffMs = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const buildEmployeeSummary = (user) => {
  const info = getPersonalInfoSource(user);
  const employment = getEmploymentSource(user);
  const contactInfo = user.profile?.contactInfo || user.onboarding?.formData?.contactInfo;

  return {
    id: user._id,
    name: getLegalName(user),
    ssn:
      info.ssn || user.onboarding?.formData?.personalInfo?.ssn || "N/A",
    workAuthorization: employment?.workAuthorization || "N/A",
    phone:
      contactInfo?.cellPhone ||
      contactInfo?.workPhone ||
      user.profile?.contactInfo?.cellPhone ||
      "N/A",
    email: user.email,
    onboardingStatus: user.onboarding?.status || "never_submitted"
  };
};

router.post("/token", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const tokenValue = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const baseUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const registrationLink = `${baseUrl}/register?token=${tokenValue}&email=${encodeURIComponent(email)}`;

    const token = await Token.create({
      email,
      name,
      token: tokenValue,
      expiresAt,
      registrationLink,
      createdBy: req.user._id
    });

    await sendRegistrationEmail(email, registrationLink);

    res.json({
      message: "Registration link sent",
      token: {
        id: token._id,
        email: token.email,
        name: token.name,
        expiresAt: token.expiresAt,
        registrationLink: token.registrationLink
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/tokens", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const tokens = await Token.find()
      .sort({ createdAt: -1 })
      .populate("usedBy", "email onboarding.status profile.personalInfo.firstName profile.personalInfo.lastName")
      .lean();

    const history = tokens.map((token) => {
      let status = "active";
      if (token.used) status = "used";
      else if (token.expiresAt < new Date()) status = "expired";

      const usedByUser = token.usedBy;
      const onboardingSubmitted =
        usedByUser?.onboarding?.status && usedByUser.onboarding.status !== "never_submitted";

      return {
        id: token._id,
        email: token.email,
        name: token.name,
        registrationLink: token.registrationLink,
        sentAt: token.createdAt,
        expiresAt: token.expiresAt,
        status,
        usedAt: token.usedAt,
        onboardingSubmitted: Boolean(onboardingSubmitted)
      };
    });

    res.json({ total: history.length, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/employees", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: "employee" };

    if (search) {
      const regex = buildRegex(search);
      filter.$or = [
        { "profile.personalInfo.firstName": regex },
        { "profile.personalInfo.lastName": regex },
        { "profile.personalInfo.preferredName": regex },
        { "onboarding.formData.personalInfo.firstName": regex },
        { "onboarding.formData.personalInfo.lastName": regex },
        { "onboarding.formData.personalInfo.preferredName": regex },
        { username: regex }
      ];
    }

    const employees = await User.find(filter)
      .sort({ "profile.personalInfo.lastName": 1, username: 1 })
      .lean();

    res.json({
      total: employees.length,
      employees: employees.map(buildEmployeeSummary)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/employees/:id", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/onboarding", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { status } = req.query;
    const allowedStatuses = ["pending", "approved", "rejected"];
    const filter = { role: "employee" };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter." });
      }
      filter["onboarding.status"] = status;
    }

    const applications = await User.find(filter)
      .sort({ "onboarding.submittedAt": -1 })
      .lean();

    const items = applications.map((user) => ({
      userId: user._id,
      name: getLegalName(user),
      email: user.email,
      status: user.onboarding?.status,
      submittedAt: user.onboarding?.submittedAt,
      feedback: user.onboarding?.feedback
    }));

    res.json({ total: items.length, applications: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/onboarding/:userId", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user || user.role !== "employee") {
      return res.status(404).json({ message: "Employee not found." });
    }
    if (!user.onboarding?.formData) {
      return res.status(404).json({ message: "Application has not been submitted." });
    }

    res.json({
      userId: user._id,
      name: getLegalName(user),
      email: user.email,
      status: user.onboarding.status,
      submittedAt: user.onboarding.submittedAt,
      feedback: user.onboarding.feedback,
      form: user.onboarding.formData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/onboarding/:userId", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "employee") {
      return res.status(404).json({ message: "Employee not found." });
    }

    if (!user.onboarding?.formData) {
      return res.status(400).json({ message: "Employee has not submitted an application." });
    }

    if (status === "approved") {
      user.profile = user.onboarding.formData;
      if (!user.profile.personalInfo) {
        user.profile.personalInfo = {};
      }
      user.profile.personalInfo.email = user.email;
      const profilePhoto = getDocuments(user).find((doc) => doc.type === "profile_picture");
      if (profilePhoto) {
        user.profile.personalInfo.profilePicture = profilePhoto.url;
      }

      const isOpt = user.profile?.employment?.workAuthorization === "f1_opt";
      user.visaWorkflow.optRequired = Boolean(isOpt);
      user.visaWorkflow.currentStep = isOpt ? "opt_receipt" : "not_applicable";
      user.onboarding.feedback = undefined;
    } else {
      user.onboarding.feedback = feedback || "Please review the comments and resubmit.";
    }

    user.onboarding.status = status;
    user.onboarding.reviewedAt = new Date();
    user.onboarding.reviewer = req.user._id;

    await user.save();

    res.json({ message: `Application ${status}`, onboarding: user.onboarding });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/visa/in-progress", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).lean();

    const list = employees
      .map((user) => {
        const progress = deriveVisaProgress(user);
        if (!progress.requiresOpt || progress.completed) return null;

        return {
          userId: user._id,
          name: getLegalName(user),
          workAuthorization: getEmploymentSource(user)?.workAuthorization,
          startDate: user.profile?.employment?.startDate,
          endDate: user.profile?.employment?.endDate,
          daysRemaining: computeDaysRemaining(user),
          nextStep: progress.nextStep,
          action: progress.action,
          pendingDocument: progress.pendingDocument
            ? {
                type: progress.pendingDocument.type,
                url: progress.pendingDocument.url,
                status: progress.pendingDocument.status,
                feedback: progress.pendingDocument.feedback
              }
            : null
        };
      })
      .filter(Boolean);

    res.json({ total: list.length, employees: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/visa/all", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).lean();

    const records = employees
      .map((user) => {
        const approvedDocs = getDocuments(user)
          .filter((doc) => doc.category === "visa" && doc.status === "approved")
          .map((doc) => ({
            type: doc.type,
            label: doc.label,
            url: doc.url,
            reviewedAt: doc.reviewedAt
          }));

        const progress = deriveVisaProgress(user);
        if (!progress.requiresOpt && approvedDocs.length === 0) {
          return null;
        }

        return {
          userId: user._id,
          name: getLegalName(user),
          documents: approvedDocs,
          currentStep: progress.currentStep
        };
      })
      .filter(Boolean);

    res.json({ total: records.length, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/visa/documents/:userId/:type", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    const docConfig = VISA_FLOW.find((item) => item.type === req.params.type);
    if (!docConfig) {
      return res.status(400).json({ message: "Unknown visa document type." });
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "employee") {
      return res.status(404).json({ message: "Employee not found." });
    }

    const document = getDocuments(user).find((doc) => doc.type === docConfig.type);
    if (!document) {
      return res.status(404).json({ message: "Document not found for this employee." });
    }

    document.status = status;
    document.feedback = status === "approved" ? undefined : feedback;
    document.reviewedAt = new Date();
    document.reviewer = req.user._id;

    if (status === "approved") {
      const index = VISA_FLOW.findIndex((item) => item.type === docConfig.type);
      const nextStep = VISA_FLOW[index + 1];
      user.visaWorkflow.currentStep = nextStep ? nextStep.type : "completed";
    } else {
      user.visaWorkflow.currentStep = docConfig.type;
    }

    await user.save();

    res.json({
      message: `${docConfig.label} marked as ${status}`,
      document,
      visaWorkflow: user.visaWorkflow
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/visa/notify/:userId", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { message, subject } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "employee") {
      return res.status(404).json({ message: "Employee not found." });
    }

    const emailSubject = subject || "Visa Status Update";
    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: `<p>Hello ${getLegalName(user)},</p><p>${message}</p>`
    });

    user.visaWorkflow.notificationLog.push({ subject: emailSubject, message, sentAt: new Date() });
    user.visaWorkflow.lastNotificationAt = new Date();
    await user.save();

    res.json({ message: "Notification sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
