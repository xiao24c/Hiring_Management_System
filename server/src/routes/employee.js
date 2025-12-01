import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import VisaStatus from "../models/VisaStatus.js";

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

const ensureOnboardingRecord = async (userId, email) => {
  const defaults = {
    user: userId,
    formData: { personalInfo: { email } }
  };
  const record = await OnboardingApplication.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: defaults },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return record;
};

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

const buildVisaSummary = (visaRecord) => {
  if (!visaRecord || !visaRecord.requiresOpt) {
    return { requiresOpt: false, currentStep: "not_applicable", documents: [] };
  }

  const docs = VISA_TYPES.map((type) => {
    const entry = getVisaDocuments(visaRecord).find((doc) => doc.type === type) || {};
    return {
      type,
      label: DOCUMENT_LABELS[type],
      status: entry.status || "not_uploaded",
      url: entry.url || null,
      feedback: entry.feedback || null,
      reviewedAt: entry.reviewedAt || null
    };
  });

  let currentStep = "opt_receipt";
  let message = "Please upload your OPT Receipt.";

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (doc.status === "not_uploaded") {
      currentStep = doc.type;
      message = `Please upload ${doc.label}.`;
      break;
    }
    if (doc.status === "pending") {
      currentStep = doc.type;
      message = `Waiting for HR to review your ${doc.label}.`;
      break;
    }
    if (doc.status === "rejected") {
      currentStep = doc.type;
      message = doc.feedback || `${doc.label} was rejected. Please upload an updated version.`;
      break;
    }
    if (i === docs.length - 1 && doc.status === "approved") {
      currentStep = "completed";
      message = "All documents have been approved.";
    }
  }

  return { requiresOpt: true, currentStep, message, documents: docs };
};

const sanitizeOnboardingPayload = (payload, email) => {
  if (!payload) return payload;
  const copy = { ...payload };

  if (copy.personalInfo) {
    copy.personalInfo = {
      ...copy.personalInfo,
      email,
      gender: normalizeGender(copy.personalInfo.gender)
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

const requiresOpt = (formData) => formData?.employment?.workAuthorization === "f1_opt";

const getVisaDocuments = (visaRecord) => (Array.isArray(visaRecord?.documents) ? visaRecord.documents : []);

router.use(protect);
router.use(roleCheck(["employee", "hr"]));

router.get("/profile", async (req, res) => {
  try {
    const onboarding = await ensureOnboardingRecord(req.user._id, req.user.email);
    const visaRecord = await ensureVisaRecord(req.user._id);
    const approvedProfile = onboarding.status === "approved" ? onboarding.formData : null;

    res.json({
      profile: approvedProfile,
      onboardingStatus: onboarding.status,
      onboardingApplication: onboarding.formData,
      onboardingFeedback: onboarding.feedback,
      documents: onboarding.documents || [],
      visaStatus: buildVisaSummary(visaRecord)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    const onboarding = await ensureOnboardingRecord(req.user._id, req.user.email);
    if (onboarding.status === "approved") {
      return res.status(400).json({ message: "Onboarding already approved." });
    }

    const payload = sanitizeOnboardingPayload(req.body, req.user.email);
    if (!payload?.personalInfo?.firstName || !payload?.personalInfo?.lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    onboarding.formData = payload;
    onboarding.status = "pending";
    onboarding.submittedAt = new Date();
    onboarding.feedback = undefined;
    await onboarding.save();

    const visaRecord = await ensureVisaRecord(req.user._id);
    const needsOpt = requiresOpt(payload);
    visaRecord.requiresOpt = needsOpt;
    visaRecord.currentStep = needsOpt ? "opt_receipt" : "not_applicable";
    if (!needsOpt) {
      visaRecord.documents = [];
    }
    await visaRecord.save();

    res.json({ message: "Onboarding application submitted.", onboardingStatus: onboarding.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const onboarding = await ensureOnboardingRecord(req.user._id, req.user.email);
    if (onboarding.status !== "approved") {
      return res.status(400).json({ message: "Profile cannot be edited until onboarding is approved." });
    }

    const updates = sanitizeOnboardingPayload(req.body, req.user.email);
    const baseForm =
      onboarding.formData && onboarding.formData.toObject
        ? onboarding.formData.toObject()
        : onboarding.formData || {};
    const updatedForm = { ...baseForm };
    ["personalInfo", "address", "contactInfo", "employment", "reference", "emergencyContacts"].forEach((section) => {
      if (updates[section] !== undefined) {
        updatedForm[section] = updates[section];
      }
    });

    onboarding.formData = updatedForm;
    await onboarding.save();

    if (updates.employment) {
      const visaRecord = await ensureVisaRecord(req.user._id);
      const needsOpt = requiresOpt(updatedForm);
      visaRecord.requiresOpt = needsOpt;
      visaRecord.currentStep = needsOpt ? visaRecord.currentStep || "opt_receipt" : "not_applicable";
      if (!needsOpt) {
        visaRecord.documents = [];
      }
      await visaRecord.save();
    }

    res.json({ message: "Profile updated.", profile: onboarding.formData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/visa-status", async (req, res) => {
  try {
    const visaRecord = await ensureVisaRecord(req.user._id);
    res.json(buildVisaSummary(visaRecord));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const onboarding = await ensureOnboardingRecord(req.user._id, req.user.email);
    res.json({ documents: onboarding.documents || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const ensureVisaUploadOrder = (visaRecord, type) => {
  const index = VISA_TYPES.indexOf(type);
  if (index === -1 || !visaRecord.requiresOpt) return;

  for (let i = 0; i < index; i++) {
    const previous = getVisaDocuments(visaRecord).find((doc) => doc.type === VISA_TYPES[i]);
    if (!previous || previous.status !== "approved") {
      const error = new Error(`Please wait for ${DOCUMENT_LABELS[VISA_TYPES[i]]} to be approved first.`);
      error.statusCode = 400;
      throw error;
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

    const fileUrl = `/uploads/${req.file.filename}`;
    const payload = {
      type,
      label: DOCUMENT_LABELS[type],
      url: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    if (VISA_TYPES.includes(type)) {
      const visaRecord = await ensureVisaRecord(req.user._id);
      if (!visaRecord.requiresOpt) {
        return res.status(400).json({ message: "Visa documents are only required for OPT employees." });
      }

      ensureVisaUploadOrder(visaRecord, type);

      const documents = getVisaDocuments(visaRecord);
      const existingIndex = documents.findIndex((doc) => doc.type === type);
      const docPayload = {
        ...payload,
        category: "visa",
        status: "pending",
        feedback: undefined,
        reviewedAt: undefined,
        reviewer: undefined
      };
      if (existingIndex > -1) {
        documents[existingIndex] = { ...documents[existingIndex], ...docPayload };
      } else {
        documents.push(docPayload);
      }
      visaRecord.documents = documents;
      visaRecord.currentStep = type;
      await visaRecord.save();

      return res.json({ message: "Document uploaded.", document: docPayload });
    }

    const onboarding = await ensureOnboardingRecord(req.user._id, req.user.email);
    const documents = Array.isArray(onboarding.documents) ? onboarding.documents : [];
    const existingIndex = documents.findIndex((doc) => doc.type === type);
    const docPayload = {
      ...payload,
      category: "onboarding",
      status: "uploaded"
    };
    if (type === "profile_picture") {
      onboarding.formData = onboarding.formData || {};
      onboarding.formData.personalInfo = onboarding.formData.personalInfo || {};
      onboarding.formData.personalInfo.profilePicture = fileUrl;
    }
    if (existingIndex > -1) {
      documents[existingIndex] = { ...documents[existingIndex], ...docPayload };
    } else {
      documents.push(docPayload);
    }
    onboarding.documents = documents;
    await onboarding.save();

    res.json({ message: "Document uploaded.", document: docPayload });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

export default router;
