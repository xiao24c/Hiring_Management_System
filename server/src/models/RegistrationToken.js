import mongoose from "mongoose";
const { Schema } = mongoose;

const RegistrationTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    token: {
      type: String,
      required: true,
      unique: true
    },

    used: {
      type: Boolean,
      default: false
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

const RegistrationToken = mongoose.model("RegistrationToken", RegistrationTokenSchema);
export default RegistrationToken;