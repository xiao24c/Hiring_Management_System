import { Router } from "express";
import {
  getMyOnboarding,
  saveMyOnboarding,
  submitMyOnboarding
} from "../controllers/onboardingController.js";
import auth from "../middleware/auth.js";

const router = Router();

// load onboarding data for the current user
router.get("/me", auth, getMyOnboarding);

// save/update draft
router.post("/me", auth, saveMyOnboarding);

// submit onboarding application
router.post("/submit", auth, submitMyOnboarding);

export default router;