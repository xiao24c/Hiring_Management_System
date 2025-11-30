import mongoose from "mongoose";

const { Schema } = mongoose;

const registrationTokenSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: String,
    token: { type: String, required: true, unique: true },
    registrationLink: String,
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    usedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const RegistrationToken = mongoose.model("RegistrationToken", registrationTokenSchema);

export default RegistrationToken;
