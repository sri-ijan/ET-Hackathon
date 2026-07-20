import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Use memory storage to avoid saving files to disk before forwarding to AI service
const storage = multer.memoryStorage();

// File filter: accept only PDF and Word (.docx, .doc) files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type not supported: ${file.originalname}. Only PDF and DOCX documents are allowed!`, 400), false);
  }
};

// Configure Multer instances
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
  },
});

// Export specific middleware that handles both 'specification' and 'submittal' fields
export const uploadComplianceDocuments = upload.fields([
  { name: 'specification', maxCount: 1 },
  { name: 'submittal', maxCount: 1 },
]);
<<<<<<< HEAD
=======

// Single-file upload for RFI Copilot document ingestion
export const uploadRfiDocument = upload.single('document');
>>>>>>> d243e42 (RAG pipeline sorted)
