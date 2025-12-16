// src/controllers/visaController.js
import VisaStatus from "../models/VisaStatus.js";

/* -------------------------------------------------
   Helper: Determine current active step
-------------------------------------------------- */
const getActiveStep = (visa) => {
  if (visa.optReceipt.status !== "approved") return "optReceipt";
  if (visa.optEAD.status !== "approved") return "optEAD";
  if (visa.i983.status !== "approved") return "i983";
  return "i20";
};

/* -------------------------------------------------
   GET /api/visa/me
   Employee views entire visa status
-------------------------------------------------- */
export const getMyVisaStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    let visa = await VisaStatus.findOne({ userId });

    // First-time access → auto-create empty F1 workflow
    if (!visa) {
      visa = await VisaStatus.create({ userId });
    }

    const activeStep = getActiveStep(visa);

    res.json({
      userId,
      activeStep,
      steps: {
        optReceipt: visa.optReceipt,
        optEAD: visa.optEAD,
        i983: visa.i983,
        i20: visa.i20
      }
    });

  } catch (err) {
    console.error("getMyVisaStatus error:", err);
    res.status(500).json({ msg: "Server error loading visa status" });
  }
};

/* -------------------------------------------------
   POST /api/visa/me/upload
   Employee uploads file for current step
-------------------------------------------------- */
export const uploadVisaDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ msg: "fileUrl is required" });
    }

    const visa = await VisaStatus.findOne({ userId });
    if (!visa) return res.status(404).json({ msg: "Visa workflow not found" });

    const activeStep = getActiveStep(visa);
    const step = visa[activeStep];

    if (step.status !== "not_submitted" && step.status !== "rejected") {
      return res.status(400).json({ msg: "Cannot upload file at this stage" });
    }

    step.fileUrl = fileUrl;
    step.status = "pending";
    step.submittedAt = new Date();
    step.feedback = "";

    await visa.save();

    res.json({
      msg: `Uploaded file for ${activeStep}`,
      step: activeStep,
      status: "pending"
    });

  } catch (err) {
    console.error("uploadVisaDocument error:", err);
    res.status(500).json({ msg: "Server error uploading document" });
  }
};

/* -------------------------------------------------
   GET /api/visa/me/:step
   Employee views details of a step
-------------------------------------------------- */
export const getVisaStepDetail = async (req, res) => {
  try {
    const { step } = req.params;
    const userId = req.user.userId;

    const visa = await VisaStatus.findOne({ userId }).lean();
    if (!visa) return res.status(404).json({ msg: "Visa workflow not found" });

    if (!visa[step]) return res.status(400).json({ msg: "Invalid step" });

    res.json({
      step,
      ...visa[step]
    });

  } catch (err) {
    console.error("getVisaStepDetail error:", err);
    res.status(500).json({ msg: "Server error retrieving step" });
  }
};

/* -------------------------------------------------
   POST /api/visa/me/:step/resubmit
-------------------------------------------------- */
export const resubmitVisaStep = async (req, res) => {
  try {
    const { step } = req.params;
    const { fileUrl } = req.body;
    const userId = req.user.userId;

    const visa = await VisaStatus.findOne({ userId });
    if (!visa) return res.status(404).json({ msg: "Visa workflow not found" });

    if (!visa[step]) {
      return res.status(400).json({ msg: "Invalid step" });
    }

    const s = visa[step];

    if (s.status !== "rejected") {
      return res.status(400).json({ msg: "Only rejected steps can be resubmitted" });
    }

    if (!fileUrl) {
      return res.status(400).json({ msg: "fileUrl is required" });
    }

    s.status = "pending";
    s.fileUrl = fileUrl;
    s.feedback = "";
    s.submittedAt = new Date();

    await visa.save();

    res.json({
      msg: `${step} re-submitted and pending HR review`
    });

  } catch (err) {
    console.error("resubmitVisaStep error:", err);
    res.status(500).json({ msg: "Server error re-submitting step" });
  }
};