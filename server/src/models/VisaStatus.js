import mongoose from "mongoose";
const { Schema } = mongoose;

const StepSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["not_submitted", "pending", "rejected", "approved"],
      default: "not_submitted"
    },
    fileUrl: { type: String, default: "" },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date }
  },
  { _id: false }
);

const VisaStatusSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    optReceipt: { type: StepSchema, default: () => ({}) },
    optEAD: { type: StepSchema, default: () => ({}) },
    i983: { type: StepSchema, default: () => ({}) },
    i20: { type: StepSchema, default: () => ({}) }
  },
  { timestamps: true }
);

const VisaStatus = mongoose.model("VisaStatus", VisaStatusSchema);
export default VisaStatus;