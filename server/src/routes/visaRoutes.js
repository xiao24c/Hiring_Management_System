// src/routes/visaRoutes.js
import { Router } from "express";
import auth from "../middleware/auth.js";

import {
  getMyVisaStatus,
  uploadVisaDocument,
  getVisaStepDetail,
  resubmitVisaStep
} from "../controllers/visaController.js";

const router = Router();

/********************************************
 * EMPLOYEE VISA WORKFLOW ROUTES
 ********************************************/

// 1. 查看整个 F1 流程
router.get("/me", auth, getMyVisaStatus);

// 2. 上传当前步骤文件（optReceipt → optEAD → i983 → i20）
router.post("/me/upload", auth, uploadVisaDocument);

// 3. 查看某一步的详情（含 feedback）
router.get("/me/:step", auth, getVisaStepDetail);

// 4. 被 reject 之后允许重新上传
router.post("/me/:step/resubmit", auth, resubmitVisaStep);

export default router;