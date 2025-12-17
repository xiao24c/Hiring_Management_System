import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import auth from "../middleware/auth.js";
import { handleFileUpload } from "../controllers/uploadController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post("/", auth, upload.single("file"), handleFileUpload);

export default router;
