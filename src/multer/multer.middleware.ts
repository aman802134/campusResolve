import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
// __filename and __dirname are available by default in CommonJS, no need to redefine them

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) {
    let subFolder = 'others';
    if (file.mimetype.startsWith('image/')) {
      subFolder = 'images';
    } else if (file.mimetype === 'application/pdf') {
      subFolder = 'documents';
    }
    const uploadPath = path.join(uploadDir, subFolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only specific file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only jpg, png, or pdf files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
