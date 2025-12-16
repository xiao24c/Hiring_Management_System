import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/hr", hrRoutes);

export default app;