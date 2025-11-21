import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and documents
const fileFilter = (req, file, cb) => {
  // Allow images and specific document types
  if (file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP) and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

export const profileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});
