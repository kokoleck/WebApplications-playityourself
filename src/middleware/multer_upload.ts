import multer from 'multer';
import path from 'path';
import express from 'express';

// הגדרת תיקיית ה-upload
const uploadPath = path.join(__dirname, '../../uploads');

// לוודא שהתיקייה קיימת
import fs from 'fs';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// הגדרת אכסון הקבצים
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Multer: Setting destination to ${uploadPath}`);
    cb(null, uploadPath);  // שמירה בתיקיית uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`Multer: Generating filename ${filename}`);
    cb(null, filename);  // שם ייחודי לקובץ
  }
});

// סינון קבצים לקבלת רק תמונות
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // רק תמונות
  } else {
    cb(new Error('Not an image!'), false);
  }
};

// הגדרת upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // מגבלת גודל של 10MB
  }
});

console.log("Multer configuration loaded.");
