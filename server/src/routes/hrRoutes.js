// src/routes/hrRoutes.js
import { Router } from "express";
import hrAuth from "../middleware/hrAuth.js";

// Employees
import {
  getAllEmployees,
  getEmployeeById
} from "../controllers/hrEmployeesController.js";

// Onboarding
import {
  getAllOnboardingApplications,
  getOnboardingDetail,
  approveOnboarding,
  rejectOnboarding
} from "../controllers/hrOnboardingController.js";

// Visa
import {
  getVisaSummaryList,
  getVisaDetail,
  advanceVisaStatus,
} from "../controllers/hrVisaController.js";

// Tokens
import {
  generateRegistrationToken,
  listRegistrationTokens,
  deleteRegistrationToken
} from "../controllers/hrTokenController.js";

const router = Router();

/************ Employees ************/
router.get("/employees", hrAuth, getAllEmployees);
router.get("/employees/:userId", hrAuth, getEmployeeById);

/************ Visa ************/
router.get("/visa", hrAuth, getVisaSummaryList);
router.get("/visa/:userId", hrAuth, getVisaDetail);
router.post("/visa/:userId/action", hrAuth, advanceVisaStatus);

/************ Tokens ************/
router.post("/tokens", hrAuth, generateRegistrationToken);
router.get("/tokens", hrAuth, listRegistrationTokens);
router.delete("/tokens/:tokenId", hrAuth, deleteRegistrationToken);

/************ Onboarding ************/
router.get("/onboarding", hrAuth, getAllOnboardingApplications);
router.get("/onboarding/:onboardingId", hrAuth, getOnboardingDetail);
router.post("/onboarding/:onboardingId/approve", hrAuth, approveOnboarding);
router.post("/onboarding/:onboardingId/reject", hrAuth, rejectOnboarding);

export default router;