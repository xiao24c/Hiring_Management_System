import express from "express";
import crypto from "crypto";
import RegistrationToken from "../models/RegistrationToken.js";
import User from "../models/User.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import VisaStatus from "../models/VisaStatus.js";
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

const getLegalName = (application, fallback) => {
  const info = application?.formData?.personalInfo || {};
  const legal = [info.firstName, info.middleName, info.lastName].filter(Boolean).join(" ");
  if (info.preferredName) return info.preferredName;
  if (!legal) return fallback;
  return legal;
};

const computeDaysRemaining = (application) => {
  const endDate = application?.formData?.employment?.endDate;
  if (!endDate) return null;
  const diffMs = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const loadOnboardingMap = async (userIds) => {
  const records = await OnboardingApplication.find({ user: { $in: userIds } }).lean();
  return records.reduce((acc, record) => {
    acc[record.user.toString()] = record;
    return acc;
  }, {});
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

    const token = await RegistrationToken.create({
      email,
      name,
      token: tokenValue,
      expiresAt,
      registrationLink,
      createdBy: req.user._id
    });

    // await sendRegistrationEmail(email, registrationLink);
    // Temporarily disable automatic email delivery until SMTP credentials are resolved.

    res.json({
      message: "Registration link generated",
      token: {
        id: token._id,
        email: token.email,
        name: token.name,
        value: token.token,
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
    const tokens = await RegistrationToken.find()
      .sort({ createdAt: -1 })
      .populate("usedBy", "email username")
      .lean();

    const usedIds = tokens.map((token) => token.usedBy?._id).filter(Boolean);
    const onboardingMap = await loadOnboardingMap(usedIds);

    const history = tokens.map((token) => {
      let status = "active";
      if (token.used) status = "used";
      else if (token.expiresAt < new Date()) status = "expired";

      const onboarding = token.usedBy ? onboardingMap[token.usedBy._id.toString()] : null;
      const onboardingSubmitted = onboarding?.status && onboarding.status !== "never_submitted";

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
    const userFilter = { role: "employee" };
    const users = await User.find(userFilter).select("username email role").lean();
    const onboardingRecords = await OnboardingApplication.find({ user: { $in: users.map((u) => u._id) } }).lean();
    const onboardingMap = onboardingRecords.reduce((acc, record) => {
      acc[record.user.toString()] = record;
      return acc;
    }, {});

    let employees = users
      .map((user) => {
        const onboarding = onboardingMap[user._id.toString()];
        const personalInfo = onboarding?.formData?.personalInfo || {};
        const contact = onboarding?.formData?.contactInfo || {};
        const employment = onboarding?.formData?.employment || {};
        const name = getLegalName(onboarding, user.username);
        return {
          id: user._id,
          name,
          ssn: personalInfo.ssn || "N/A",
          workAuthorization: employment.workAuthorization || "N/A",
          phone: contact.cellPhone || contact.workPhone || "N/A",
          email: user.email,
          onboardingStatus: onboarding?.status || "never_submitted"
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (search) {
      const query = search.toLowerCase();
      employees = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          (emp.phone && emp.phone.toLowerCase().includes(query))
      );
    }

    res.json({ total: employees.length, employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/employees/:id", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const onboarding = await OnboardingApplication.findOne({ user: req.params.id })
      .populate("user", "email username")
      .lean();
    if (!onboarding) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json({ employee: onboarding });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/onboarding", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const { status } = req.query;
    const allowedStatuses = ["pending", "approved", "rejected"];
    const filter = {};
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter." });
      }
      filter.status = status;
    }
    const applications = await OnboardingApplication.find(filter)
      .populate("user", "email username")
      .sort({ submittedAt: -1 })
      .lean();

    const items = applications.map((record) => ({
      userId: record.user._id,
      name: getLegalName(record, record.user.username),
      email: record.user.email,
      status: record.status,
      submittedAt: record.submittedAt,
      feedback: record.feedback
    }));

    res.json({ total: items.length, applications: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/onboarding/:userId", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const record = await OnboardingApplication.findOne({ user: req.params.userId })
      .populate("user", "email username")
      .lean();
    if (!record) {
      return res.status(404).json({ message: "Application has not been submitted." });
    }
    if (!record.formData) {
      return res.status(404).json({ message: "Application has not been submitted." });
    }

    res.json({
      userId: record.user._id,
      name: getLegalName(record, record.user.username),
      email: record.user.email,
      status: record.status,
      submittedAt: record.submittedAt,
      feedback: record.feedback,
      form: record.formData
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

    const record = await OnboardingApplication.findOne({ user: req.params.userId });
    if (!record || !record.formData) {
      return res.status(400).json({ message: "Employee has not submitted an application." });
    }

    record.status = status;
    record.reviewedAt = new Date();
    record.reviewer = req.user._id;
    record.feedback = status === "approved" ? undefined : feedback || "Please review the comments and resubmit.";
    if (status === "approved") {
      record.feedback = undefined;
    }
    await record.save();

    res.json({ message: `Application ${status}`, onboarding: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/visa/in-progress", protect, roleCheck(["hr"]), async (req, res) => {
  try {
    const visaRecords = await VisaStatus.find({ requiresOpt: true }).populate("user", "email username").lean();
    const onboardingMap = await loadOnboardingMap(visaRecords.map((record) => record.user._id));

    const list = visaRecords
      .map((record) => {
        const onboarding = onboardingMap[record.user._id.toString()];
        if (!onboarding || record.currentStep === "completed") return null;

        const employment = onboarding?.formData?.employment;
        const progress = (() => {
          const docList = Array.isArray(record.documents) ? record.documents : [];
          const documents = VISA_FLOW.map((item) => ({
            label: item.label,
            type: item.type,
            document: docList.find((doc) => doc.type === item.type)
          }));

          for (let i = 0; i < documents.length; i++) {
            const entry = documents[i];
            if (!entry.document || entry.document.status === "not_uploaded") {
              return {
                nextStep: `Employee must upload ${entry.label}`,
                action: "notify",
                pendingDocument: null
              };
            }
            if (entry.document.status === "pending") {
              return {
                nextStep: `Waiting for HR to review ${entry.label}`,
                action: "review",
                pendingDocument: entry.document
              };
            }
            if (entry.document.status === "rejected") {
              return {
                nextStep: entry.document.feedback || `${entry.label} was rejected. Employee must resubmit.`,
                action: "notify",
                pendingDocument: entry.document
              };
            }
          }
          return {
            nextStep: "All documents have been approved.",
            action: null,
            pendingDocument: null
          };
        })();

        const name = getLegalName(onboarding, record.user.username);
        return {
          userId: record.user._id,
          name,
          workAuthorization: employment?.workAuthorization,
          startDate: employment?.startDate,
          endDate: employment?.endDate,
          daysRemaining: computeDaysRemaining(onboarding),
          nextStep: progress.nextStep,
          action: progress.action,
          pendingDocument: progress.pendingDocument
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
    const visaRecords = await VisaStatus.find({ requiresOpt: true }).populate("user", "email username").lean();
    const onboardingMap = await loadOnboardingMap(visaRecords.map((record) => record.user._id));

    const records = visaRecords
      .map((record) => {
        const onboarding = onboardingMap[record.user._id.toString()];
        if (!onboarding) return null;
        const name = getLegalName(onboarding, record.user.username);
        const docList = Array.isArray(record.documents) ? record.documents : [];
        const approvedDocs = docList.filter((doc) => doc.status === "approved");
        return {
          userId: record.user._id,
          name,
          documents: approvedDocs,
          currentStep: record.currentStep
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

    const visaRecord = await VisaStatus.findOne({ user: req.params.userId });
    if (!visaRecord) {
      return res.status(404).json({ message: "Employee visa record not found." });
    }

    const document = visaRecord.documents.find((doc) => doc.type === docConfig.type);
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
      visaRecord.currentStep = nextStep ? nextStep.type : "completed";
    } else {
      visaRecord.currentStep = docConfig.type;
    }

    await visaRecord.save();

    res.json({ message: `${docConfig.label} marked as ${status}`, document, visaWorkflow: visaRecord });
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

    const onboarding = await OnboardingApplication.findOne({ user: user._id }).lean();
    const name = getLegalName(onboarding, user.username);

    const emailSubject = subject || "Visa Status Update";
    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: `<p>Hello ${name},</p><p>${message}</p>`
    });

    const visaRecord = await ensureVisaRecord(user._id);
    visaRecord.notificationLog.push({ subject: emailSubject, message, sentAt: new Date() });
    visaRecord.lastNotificationAt = new Date();
    await visaRecord.save();

    res.json({ message: "Notification sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const ensureVisaRecord = async (userId) => {
  const record = await VisaStatus.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (record && !record.userId) {
    record.userId = record.user || userId;
    await record.save();
  }
  return record;
};

export default router;
