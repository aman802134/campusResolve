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
    cb(null, uploadDir);
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
  if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
    // upload only png and jpg format
    return cb(new Error('Please upload an jpg or png image'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
