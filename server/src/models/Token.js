import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: String,
    token: { type: String, required: true },
    registrationLink: String,
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Token", tokenSchema);
