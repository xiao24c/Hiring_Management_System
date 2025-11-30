import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    subject: String,
    message: String,
    sentAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const visaDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["opt_receipt", "opt_ead", "i_983", "i_20"],
      required: true
    },
    label: String,
    url: String,
    fileName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    status: {
      type: String,
      enum: ["not_uploaded", "pending", "approved", "rejected"],
      default: "not_uploaded"
    },
    feedback: String,
    uploadedAt: Date,
    reviewedAt: Date,
    reviewer: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const visaStatusSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    requiresOpt: { type: Boolean, default: false },
    currentStep: {
      type: String,
      enum: ["not_applicable", "opt_receipt", "opt_ead", "i_983", "i_20", "completed"],
      default: "not_applicable"
    },
    documents: { type: [visaDocumentSchema], default: [] },
    notificationLog: { type: [notificationSchema], default: [] },
    lastNotificationAt: Date
  },
  { timestamps: true }
);

const VisaStatus = mongoose.model("VisaStatus", visaStatusSchema);

export default VisaStatus;
