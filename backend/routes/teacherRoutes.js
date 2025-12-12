// routes/teacherRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const Content = require('../models/Content');
const Unit = require('../models/Unit');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure disk storage for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Auth middleware
router.use(auth('teacher'));
// POST /api/teacher/upload-pdf-file - Upload PDF and return URL
router.post('/upload-pdf-file', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;

    res.json({
      message: 'PDF uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// POST /api/teacher/content
router.post('/content', async (req, res) => {
  try {
    const { unitId, type, title, url, text } = req.body;

    if (!unitId || !type) {
      return res.status(400).json({ message: 'unitId and type are required' });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({ message: 'text is required for type=text' });
    }

    if ((type === 'pdf' || type === 'image') && !url) {
      return res.status(400).json({ message: 'url is required for pdf/image' });
    }

    const content = await Content.create({
      unit: unitId,
      type,
      title,
      url,
      text,
    });

    res.status(201).json(content);
  } catch (err) {
    console.error('Create content error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teacher/content/by-unit/:unitId  (teacher can view their unit content)
router.get('/content/by-unit/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const contents = await Content.find({ unit: unitId }).sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teacher/content/:contentId
router.delete('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const deleted = await Content.findByIdAndDelete(contentId);
    if (!deleted) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content deleted' });
  } catch (err) {
    console.error('Delete content error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.post('/upload-pdf-extract', upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });

//     const pdfId = req.file.id;

//     // Download PDF buffer
//     const chunks = [];
//     const stream = gridfsBucket.openDownloadStream(pdfId);
//     stream.on("data", (c) => chunks.push(c));

//     stream.on("end", async () => {
//       const buffer = Buffer.concat(chunks);

//       let extracted = "";

//       // 1️⃣ Try regular text extraction
//       const pdfParse = require("pdf-parse");
//       try {
//         const data = await pdfParse(buffer);
//         extracted = data.text;
//       } catch {
//         extracted = "";
//       }

//       // 2️⃣ If no text → use OCR (DeepSeek or other Ollama model)
//       if (extracted.trim().length < 50) {
//         const { ollamaExtract } = require("../utils/ollama");
//         const base64 = buffer.toString("base64");

//         const prompt = `
// Extract ALL readable text from this PDF (base64 below). Return only text.
// PDF (base64):
// ${base64}
// `;

//         extracted = await ollamaExtract("deepseek-ocr", prompt);
//       }

//       // Save extracted text inside CONTENT table
//       await Content.create({
//         unit: req.body.unitId,
//         type: "text",
//         title: req.file.originalname + " (Extracted)",
//         text: extracted,
//       });

//       return res.json({
//         message: "PDF extracted successfully",
//         extractedLength: extracted.length,
//       });
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Extract failed" });
//   }
// });

// router.post('/upload-pdf-file', upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file' });

//     const fileUrl = `${req.protocol}://${req.get('host')}/api/teacher/pdf/${req.file.id}`;

//     return res.json({
//       message: "PDF uploaded",
//       url: fileUrl,
//     });

//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Upload failed" });
//   }
// });

module.exports = router;
