import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Use memory storage to avoid saving files to disk before forwarding to AI service
const storage = multer.memoryStorage();

// File filter: accept only PDF and Word (.docx, .doc) files
const fileFilter = (req, file, cb) => {
   console.log(file.originalname);
  console.log(file.mimetype);

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

// Single-file upload for RFI Copilot document ingestion
export const uploadRfiDocument = upload.single('document');
// Parse multipart/form-data containing only text fields (no files)
export const uploadRfiQuestion = upload.none();

// Schedule CSVs need their own multer instance — the PDF/DOCX file filter above
// would reject them, and previously CSV/Excel mimetypes were mistakenly added to
// that shared filter, which meant a spreadsheet could also slip through as a
// "specification" or "submittal" upload on the compare-specs endpoint. Browsers
// are inconsistent about CSV mimetypes (text/csv, application/vnd.ms-excel, or
// even application/octet-stream), so we check the file extension instead of
// trusting the mimetype.
const csvFileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new AppError(`File type not supported: ${file.originalname}. Only .csv schedule files are allowed.`, 400), false);
  }
};

const csvUpload = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB — schedules are small text files
});

// Upload middleware for Schedule Risk Radar
export const uploadScheduleFile = csvUpload.single('schedule');
