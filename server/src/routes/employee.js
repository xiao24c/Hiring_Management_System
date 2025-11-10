import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

const uploadDir = path.resolve("src/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg"];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type. Use PDF or image files."), false);
    }
    cb(null, true);
  }
});

const VISA_TYPES = ["opt_receipt", "opt_ead", "i_983", "i_20"];
const DOCUMENT_LABELS = {
  profile_picture: "Profile Picture",
  drivers_license: "Driver's License",
  work_authorization: "Work Authorization",
  opt_receipt: "OPT Receipt",
  opt_ead: "OPT EAD",
  i_983: "Form I-983",
  i_20: "I-20",
  other: "Supporting Document"
};

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("male")) return "male";
  if (normalized.includes("female")) return "female";
  return "prefer_not_to_answer";
};

const normalizeWorkAuth = (value) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("green")) return "green_card";
  if (normalized.includes("citizen")) return "citizen";
  if (normalized.includes("h1")) return "h1b";
  if (normalized.includes("l2")) return "l2";
  if (normalized.includes("f1")) return "f1_opt";
  if (normalized.includes("h4")) return "h4";
  if (normalized === "other") return "other";
  return value;
};

const normalizeCitizenship = (value) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("citizen")) return "citizen";
  if (normalized.includes("green")) return "green_card";
  return "non_resident";
};

const getDocuments = (user) => (Array.isArray(user.documents) ? user.documents : []);

const getDocumentByType = (user, type) =>
  getDocuments(user).find((doc) => doc.type === type);

const requiresOpt = (user) => {
  const workAuth =
    user.profile?.employment?.workAuthorization ||
    user.onboarding?.formData?.employment?.workAuthorization;
  return workAuth === "f1_opt";
};

const buildVisaSummary = (user) => {
  if (!requiresOpt(user)) {
    return {
      requiresOpt: false,
      currentStep: "not_applicable",
      documents: []
    };
  }

  const documents = VISA_TYPES.map((type) => {
    const doc = getDocumentByType(user, type);
    return {
      type,
      label: DOCUMENT_LABELS[type],
      status: doc?.status || "not_uploaded",
      url: doc?.url || null,
      feedback: doc?.feedback || null,
      reviewedAt: doc?.reviewedAt || null
    };
  });

  let currentStep = "opt_receipt";
  let message = "Please upload your OPT Receipt.";

  for (let i = 0; i < documents.length; i++) {
    const entry = documents[i];
    if (entry.status === "not_uploaded") {
      currentStep = entry.type;
      message = `Please upload ${entry.label}.`;
      break;
    }
    if (entry.status === "pending") {
      currentStep = entry.type;
      message = `Waiting for HR to review your ${entry.label}.`;
      break;
    }
    if (entry.status === "rejected") {
      currentStep = entry.type;
      message = entry.feedback || `${entry.label} was rejected. Please upload an updated version.`;
      break;
    }
    if (i === documents.length - 1 && entry.status === "approved") {
      currentStep = "completed";
      message = "All documents have been approved.";
    }
  }

  return {
    requiresOpt: true,
    currentStep,
    message,
    documents
  };
};

const sanitizeOnboardingPayload = (payload, email) => {
  if (!payload) return payload;
  const copy = { ...payload };

  if (copy.personalInfo) {
    copy.personalInfo = {
      ...copy.personalInfo,
      email,
      gender: normalizeGender(copy.personalInfo.gender),
      citizenshipStatus: normalizeCitizenship(copy.personalInfo.citizenshipStatus)
    };
  }

  if (copy.employment) {
    copy.employment = {
      ...copy.employment,
      workAuthorization: normalizeWorkAuth(copy.employment.workAuthorization)
    };
  }

  return copy;
};

router.use(protect);
router.use(roleCheck(["employee", "hr"]));

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      profile: user.profile || null,
      onboardingStatus: user.onboarding?.status || "never_submitted",
      onboardingApplication: user.onboarding?.formData || null,
      onboardingFeedback: user.onboarding?.feedback || null,
      documents: user.documents || [],
      visaStatus: buildVisaSummary(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.onboarding?.status === "approved") {
      return res.status(400).json({ message: "Onboarding already approved." });
    }

    const payload = sanitizeOnboardingPayload(req.body, user.email);
    if (!payload?.personalInfo?.firstName || !payload?.personalInfo?.lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    user.onboarding.formData = payload;
    user.onboarding.status = "pending";
    user.onboarding.submittedAt = new Date();
    user.onboarding.feedback = undefined;

    const isOpt = payload?.employment?.workAuthorization === "f1_opt";
    user.visaWorkflow.optRequired = Boolean(isOpt);
    user.visaWorkflow.currentStep = isOpt ? "opt_receipt" : "not_applicable";

    await user.save();

    res.json({
      message: "Onboarding application submitted.",
      onboardingStatus: user.onboarding.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);

    if (!user.profile) {
      return res.status(400).json({ message: "Profile is not available yet." });
    }

    const source = user.profile?.toObject ? user.profile.toObject() : { ...user.profile };
    const profile = { ...source };
    const sections = ["personalInfo", "address", "contactInfo", "employment", "reference", "emergencyContacts"];
    sections.forEach((section) => {
      if (updates[section] !== undefined) {
        profile[section] = updates[section];
      }
    });

    profile.personalInfo = {
      ...(profile.personalInfo || {}),
      email: user.email,
      gender: normalizeGender(profile.personalInfo?.gender)
    };

    if (profile.employment) {
      profile.employment.workAuthorization = normalizeWorkAuth(profile.employment.workAuthorization);
      const isOpt = profile.employment.workAuthorization === "f1_opt";
      user.visaWorkflow.optRequired = Boolean(isOpt);
      if (!isOpt) {
        user.visaWorkflow.currentStep = "not_applicable";
      }
    }

    user.profile = profile;
    await user.save();

    res.json({ message: "Profile updated.", profile: user.profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/visa-status", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("documents profile onboarding");
    res.json(buildVisaSummary(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("documents");
    res.json({ documents: user.documents || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const ensureVisaUploadOrder = (user, type) => {
  const index = VISA_TYPES.indexOf(type);
  if (index === -1) return;

  if (!requiresOpt(user)) {
    throw createValidationError("Visa documents are only required for OPT employees.");
  }

  for (let i = 0; i < index; i++) {
    const previous = getDocumentByType(user, VISA_TYPES[i]);
    if (!previous || previous.status !== "approved") {
      throw createValidationError(
        `Please wait for ${DOCUMENT_LABELS[VISA_TYPES[i]]} to be approved first.`
      );
    }
  }
};

router.post("/documents/:type", upload.single("file"), async (req, res) => {
  try {
    const { type } = req.params;
    if (!DOCUMENT_LABELS[type]) {
      return res.status(400).json({ message: "Unsupported document type." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "File is required." });
    }

    const user = await User.findById(req.user._id);
    ensureVisaUploadOrder(user, type);

    const category = VISA_TYPES.includes(type) ? "visa" : "onboarding";
    const status = VISA_TYPES.includes(type) ? "pending" : "uploaded";
    if (VISA_TYPES.includes(type)) {
      user.visaWorkflow.currentStep = type;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const documents = getDocuments(user);
    const payload = {
      type,
      label: DOCUMENT_LABELS[type],
      category,
      url: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status,
      uploadedAt: new Date(),
      feedback: undefined,
      reviewer: undefined,
      reviewedAt: undefined
    };

    const index = documents.findIndex((doc) => doc.type === type);
    if (index > -1) {
      documents[index] = { ...documents[index], ...payload };
    } else {
      documents.push(payload);
    }

    user.documents = documents;
    await user.save();

    res.json({ message: "Document uploaded.", document: payload });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

export default router;
