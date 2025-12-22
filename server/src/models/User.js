import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["employee", "hr"], required: true, default: "employee" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
