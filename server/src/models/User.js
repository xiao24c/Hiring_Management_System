import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    },
    citizenshipStatus: {
      type: String,
      enum: ["citizen", "green_card", "non_resident", null],
      default: null
    },
    residentType: {
      type: String,
      enum: ["citizen", "green_card", "visa_holder", null],
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
    endDate: Date,
    optReceiptNumber: String
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

const notificationSchema = new Schema(
  {
    subject: String,
    message: String,
    sentAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const visaWorkflowSchema = new Schema(
  {
    optRequired: { type: Boolean, default: false },
    currentStep: {
      type: String,
      enum: ["not_applicable", "opt_receipt", "opt_ead", "i_983", "i_20", "completed"],
      default: "not_applicable"
    },
    notificationLog: { type: [notificationSchema], default: [] },
    lastNotificationAt: Date
  },
  { _id: false }
);

const onboardingSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["never_submitted", "pending", "approved", "rejected"],
      default: "never_submitted"
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewer: { type: Schema.Types.ObjectId, ref: "User" },
    feedback: String,
    formData: onboardingFormSchema
  },
  { _id: false }
);

const profileSchema = new Schema(
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

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "hr"], default: "employee" },
  createdAt: { type: Date, default: Date.now },
  profile: profileSchema,
  onboarding: { type: onboardingSchema, default: () => ({ status: "never_submitted" }) },
  documents: { type: [documentSchema], default: [] },
  visaWorkflow: {
    type: visaWorkflowSchema,
    default: () => ({ currentStep: "not_applicable", optRequired: false })
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
