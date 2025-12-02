const express = require("express");
const multer = require("multer");

const router = express.Router();

// Configure multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// POST /api/statements/upload
router.post("/upload", upload.single("statement"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // For now: do nothing, just acknowledge upload
    // Later: add PDF/CSV parsing logic here
    return res.status(200).json({
      success: true,
      message: `File '${req.file.originalname}' uploaded successfully.`,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
