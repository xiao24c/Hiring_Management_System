import mongoose from "mongoose"
const { Schema } = mongoose;

/* -----------------------------
   Sub-schemas
------------------------------*/

// Name
const NameSchema = new Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  preferredName: { type: String, default: "" }
}, { _id: false });

// Address
const AddressSchema = new Schema({
  buildingApt: { type: String, default: "" },
  street: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zip: { type: String, default: "" }
}, { _id: false });

// Contact Info
const ContactInfoSchema = new Schema({
  cellPhone: { type: String, default: "" },
  workPhone: { type: String, default: "" }
}, { _id: false });

// Legal Info
const LegalInfoSchema = new Schema({
  ssn: { type: String, default: "" },
  dateOfBirth: { type: Date, default: null },
  gender: {
    type: String,
    enum: ["male", "female", "I don't wish to answer"],
    default: "female"
  }
}, { _id: false });

// Visa Info
const VisaInfoSchema = new Schema({
  isCitizenOrPR: { type: Boolean, default: null },

  // Only if isCitizenOrPR = true
  status: {
    type: String,
    enum: ["Green Card", "Citizen", ""],
    default: ""
  },

  // Only if isCitizenOrPR = false
  workAuthorization: {
    type: String,
    enum: ["H1B", "L2", "F1", "H4", "Other", ""],
    default: ""
  },

  // Only if workAuthorization = "F1"
  optReceiptUrl: { type: String, default: "" },

  // Only if workAuthorization = "Other"
  otherTitle: { type: String, default: "" },

  // For any non-citizen work authorization
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null }
}, { _id: false });

// Reference (only one allowed)
const ReferenceSchema = new Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  relationship: { type: String, default: "" }
}, { _id: false });

// Emergency contacts (1+)
const EmergencyContactSchema = new Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  relationship: { type: String, default: "" }
}, { _id: false });

/* -----------------------------
   Main Schema
------------------------------*/

const OnboardingApplicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["not_submitted", "pending", "rejected", "approved"],
      default: "not_submitted"
    },

    feedback: { type: String, default: "" },

    profilePictureUrl: { type: String, default: "" },

    name: { type: NameSchema, default: () => ({}) },

    address: { type: AddressSchema, default: () => ({}) },

    contactInfo: { type: ContactInfoSchema, default: () => ({}) },

    legalInfo: { type: LegalInfoSchema, default: () => ({}) },

    visaInfo: { type: VisaInfoSchema, default: () => ({}) },

    reference: { type: ReferenceSchema, default: () => ({}) },

    emergencyContacts: {
      type: [EmergencyContactSchema], // array
      default: []
    },

    submittedAt: { type: Date, default: null }
  },
  { timestamps: true } // createdAt + updatedAt
);

const OnboardingApplication = mongoose.model("OnboardingApplication", OnboardingApplicationSchema);
export default OnboardingApplication