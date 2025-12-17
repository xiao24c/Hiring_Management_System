import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
