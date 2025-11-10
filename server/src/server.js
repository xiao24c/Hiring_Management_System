import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import hrRoutes from "./routes/hr.js";
import employeeRoutes from "./routes/employee.js";

dotenv.config();
connectDB();

const app = express();
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("src/uploads")));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);

app.get("/", (req, res) => res.send("Employee Management API is running ✅"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
