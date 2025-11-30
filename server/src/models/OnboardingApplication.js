import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    building: String,
    street: String,
    city: String,
    state: String,
    zip: String
  },
  { _id: false }
);

const personalInfoSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    middleName: String,
    preferredName: String,
    profilePicture: String,
    email: String,
    ssn: String,
    dateOfBirth: Date,
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
    cellPhone: String,
    workPhone: String
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    middleName: String,
    phone: String,
    email: String,
    relationship: String
  },
  { _id: false }
);

const employmentSchema = new Schema(
  {
    workAuthorization: {
      type: String,
      enum: ["green_card", "citizen", "h1b", "l2", "f1_opt", "h4", "other", null],
      default: null
    },
    workAuthorizationOther: String,
    visaTitle: String,
    startDate: Date,
    endDate: Date
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "profile_picture",
        "drivers_license",
        "work_authorization",
        "opt_receipt",
        "opt_ead",
        "i_983",
        "i_20",
        "other"
      ],
      required: true
    },
    label: String,
    category: {
      type: String,
      enum: ["profile", "onboarding", "visa", "other"],
      default: "onboarding"
    },
    url: String,
    fileName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    status: {
      type: String,
      enum: ["uploaded", "pending", "approved", "rejected"],
      default: "uploaded"
    },
    feedback: String,
    uploadedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewer: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const onboardingFormSchema = new Schema(
  {
    personalInfo: personalInfoSchema,
    address: addressSchema,
    contactInfo: contactInfoSchema,
    employment: employmentSchema,
    reference: contactSchema,
    emergencyContacts: { type: [contactSchema], default: [] }
  },
  { _id: false }
);

const onboardingApplicationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    status: {
      type: String,
      enum: ["never_submitted", "pending", "approved", "rejected"],
      default: "never_submitted"
    },
    feedback: String,
    submittedAt: Date,
    reviewedAt: Date,
    reviewer: { type: Schema.Types.ObjectId, ref: "User" },
    formData: onboardingFormSchema,
    documents: { type: [documentSchema], default: [] }
  },
  { timestamps: true }
);

const OnboardingApplication = mongoose.model("OnboardingApplication", onboardingApplicationSchema);

export default OnboardingApplication;
