import { Router } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  validateRegistrationToken
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getCurrentUser);
router.get("/validate-token", validateRegistrationToken);

export default router;
