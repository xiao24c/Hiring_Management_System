import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const seedUsers = [
  {
    username: "hradmin",
    email: "hr@example.com",
    password: "Password123!",
    role: "hr",
    profile: {
      personalInfo: {
        firstName: "Hannah",
        lastName: "Rodriguez",
        email: "hr@example.com"
      }
    }
  },
  {
    username: "employee1",
    email: "employee1@example.com",
    password: "Password123!",
    role: "employee",
    onboarding: {
      status: "approved",
      submittedAt: new Date(),
      formData: {
        personalInfo: {
          firstName: "Emily",
          lastName: "Chen",
          preferredName: "Emily",
          email: "employee1@example.com",
          gender: "female"
        },
        address: {
          building: "123",
          street: "Main St",
          city: "San Jose",
          state: "CA",
          zip: "95112"
        },
        contactInfo: {
          cellPhone: "555-123-4567",
          workPhone: "555-987-6543"
        },
        employment: {
          workAuthorization: "f1_opt",
          visaTitle: "Software Engineer",
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      }
    },
    profile: {
      personalInfo: {
        firstName: "Emily",
        lastName: "Chen",
        preferredName: "Emily",
        email: "employee1@example.com",
        gender: "female"
      },
      address: {
        building: "123",
        street: "Main St",
        city: "San Jose",
        state: "CA",
        zip: "95112"
      },
      contactInfo: {
        cellPhone: "555-123-4567",
        workPhone: "555-987-6543"
      },
      employment: {
        workAuthorization: "f1_opt",
        visaTitle: "Software Engineer",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    },
    visaWorkflow: {
      optRequired: true,
      currentStep: "opt_receipt"
    }
  }
];

const upsertUser = async (seed) => {
  const existing = await User.findOne({ username: seed.username });
  if (existing) {
    existing.email = seed.email;
    existing.role = seed.role;
    if (seed.password) {
      existing.password = seed.password;
    }
    if (seed.profile) existing.profile = seed.profile;
    if (seed.onboarding) existing.onboarding = seed.onboarding;
    if (seed.visaWorkflow) existing.visaWorkflow = seed.visaWorkflow;
    await existing.save();
    console.log(`Updated user: ${seed.username}`);
    return existing;
  }

  const created = await User.create(seed);
  console.log(`Created user: ${seed.username}`);
  return created;
};

const run = async () => {
  try {
    await connectDB();
    for (const user of seedUsers) {
      await upsertUser(user);
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
