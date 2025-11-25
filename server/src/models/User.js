import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

// ============================================
// Basic Building Block Schemas
// ============================================

const addressSchema = new Schema(
  {
    building: { type: String, default: null },
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zip: { type: String, default: null }
  },
  { _id: false }
);

const personalInfoSchema = new Schema(
  {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    middleName: { type: String, default: null },
    preferredName: { type: String, default: null },
    profilePicture: { type: String, default: null },
    email: { type: String, default: null },
    ssn: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "prefer_not_to_answer", null],
      default: null
    }
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    cellPhone: { type: String, default: null },
    workPhone: { type: String, default: null }
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    middleName: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    relationship: { type: String, default: null }
  },
  { _id: false }
);

// ============================================
// Citizenship Schema
// ============================================

const citizenshipSchema = new Schema(
  {
    isPermanentResident: { type: Boolean, default: null },
    type: {
      type: String,
      enum: ["citizen", "green_card", null],
      default: null
    }
  },
  { _id: false }
);

// ============================================
// Work Authorization Schema
// ============================================

const workAuthorizationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["h1b", "l2", "f1_opt", "h4", "other", null],
      default: null
    },
    otherType: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  },
  { _id: false }
);

// ============================================
// Employment Schema (Citizenship + Work Authorization)
// ============================================

const employmentSchema = new Schema(
  {
    citizenship: { type: citizenshipSchema, default: () => ({}) },
    workAuthorization: { type: workAuthorizationSchema, default: () => ({}) }
  },
  { _id: false }
);

// ============================================
// Shared User Info Schema
// Used by both profile and onboarding.formData
// ============================================

const userInfoSchema = new Schema(
  {
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    address: { type: addressSchema, default: () => ({}) },
    contactInfo: { type: contactInfoSchema, default: () => ({}) },
    employment: { type: employmentSchema, default: () => ({}) },
    reference: { type: contactSchema, default: null },
    emergencyContacts: { type: [contactSchema], default: [] }
  },
  { _id: false }
);

// ============================================
// Document Schema
// ============================================

const documentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "profile_picture",
        "drivers_license",
        "i_797",           // H1B/L2 approval notice
        "opt_receipt",
        "opt_ead",
        "i_983",
        "i_20",
        "other"
      ],
      required: true
    },
    label: { type: String, default: null },
    category: {
      type: String,
      enum: ["profile", "onboarding", "visa", "other"],
      default: "onboarding"
    },
    url: { type: String, default: null },
    fileName: { type: String, default: null },
    originalName: { type: String, default: null },
    mimeType: { type: String, default: null },
    size: { type: Number, default: null },
    receiptNumber: { type: String, default: null }, // For OPT Receipt or other docs with tracking numbers
    status: {
      type: String,
      enum: ["uploaded", "pending", "approved", "rejected"],
      default: "uploaded"
    },
    feedback: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { _id: false }
);

// ============================================
// Notification Schema
// ============================================

const notificationSchema = new Schema(
  {
    subject: { type: String, default: null },
    message: { type: String, default: null },
    sentAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// ============================================
// Visa Workflow Schema
// ============================================

const visaWorkflowSchema = new Schema(
  {
    optRequired: { type: Boolean, default: false },
    currentStep: {
      type: String,
      enum: [
        "not_applicable",        // Not in OPT workflow (citizen/green card)
        "pending_opt_receipt",   // Waiting for employee to upload OPT Receipt
        "opt_receipt_pending",   // OPT Receipt under HR review
        "opt_receipt_rejected",  // OPT Receipt rejected by HR
        "pending_opt_ead",       // Waiting for employee to upload OPT EAD
        "opt_ead_pending",       // OPT EAD under HR review
        "opt_ead_rejected",      // OPT EAD rejected by HR
        "pending_i_983",         // Waiting for employee to upload I-983
        "i_983_pending",         // I-983 under HR review
        "i_983_rejected",        // I-983 rejected by HR
        "pending_i_20",          // Waiting for employee to upload I-20
        "i_20_pending",          // I-20 under HR review
        "i_20_rejected",         // I-20 rejected by HR
        "completed"              // All documents approved
      ],
      default: "not_applicable"
    },
    notificationLog: { type: [notificationSchema], default: [] },
    lastNotificationAt: { type: Date, default: null }
  },
  { _id: false }
);

// ============================================
// Onboarding Schema
// ============================================

const onboardingSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["never_submitted", "pending", "approved", "rejected"],
      default: "never_submitted"
    },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    feedback: { type: String, default: null },
    formData: { type: userInfoSchema, default: () => ({}) }
  },
  { _id: false }
);

// ============================================
// Main User Schema
// ============================================

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "hr"], default: "employee" },
  createdAt: { type: Date, default: Date.now },

  // Profile: current modifiable user information
  profile: { type: userInfoSchema, default: () => ({}) },

  // Onboarding: contains formData snapshot from submission
  onboarding: {
    type: onboardingSchema,
    default: () => ({ status: "never_submitted" })
  },

  // Documents: stored at top level with category field
  documents: { type: [documentSchema], default: [] },

  // Visa Workflow: OPT document tracking
  visaWorkflow: {
    type: visaWorkflowSchema,
    default: () => ({ currentStep: "not_applicable", optRequired: false })
  }
});

// ============================================
// Password Hashing Middleware
// ============================================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// Password Matching Method
// ============================================

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
