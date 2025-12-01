import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import OnboardingApplication from "./models/OnboardingApplication.js";
import VisaStatus from "./models/VisaStatus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedUsers = [
  {
    username: "hr_manager_1",
    email: "hr.manager1@example.com",
    password: "123456",
    role: "hr"
  },
  {
    username: "hr_manager_2",
    email: "hr.manager2@example.com",
    password: "123456",
    role: "hr"
  },
  {
    username: "employee_demo_1",
    email: "employee.demo1@example.com",
    password: "123456",
    role: "employee"
  },
  {
    username: "employee_demo_2",
    email: "employee.demo2@example.com",
    password: "123456",
    role: "employee"
  }
];

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in your .env file.");
    }

    await connectDB();
    console.log("🧹 Clearing existing database...");
    await mongoose.connection.dropDatabase();
    console.log("🌱 Seeding users...");

    for (const payload of seedUsers) {
      let user = await User.findOne({ email: payload.email });
      const isExisting = Boolean(user);
      if (isExisting) {
        user.username = payload.username;
        user.role = payload.role;
      } else {
        user = new User({ username: payload.username, email: payload.email, role: payload.role });
      }
      await user.setPassword(payload.password);
      await user.save();
      console.log(`${isExisting ? "🔁 Updated" : "✅ Created"} ${payload.email}`);

      await OnboardingApplication.findOneAndUpdate(
        { user: user._id },
        { user: user._id, "formData.personalInfo.email": payload.email },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await VisaStatus.findOneAndUpdate(
        { user: user._id },
        { $setOnInsert: { user: user._id, userId: user._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log("🎉 Seeding complete.");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
