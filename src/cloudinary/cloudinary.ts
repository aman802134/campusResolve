import fs from 'fs';
import { config } from '../config/config';
import path from 'path';

const uploadFile = async (filePath: string) => {
  try {
    if (!filePath) {
      return { msg: 'Please provide a file path' };
    }
    // Determine folder based on local directory (images or documents)
    const dirName = path.basename(path.dirname(filePath)); // e.g., 'images' or 'documents'
    const cloudinaryFolder =
      dirName === 'images' ? 'images' : dirName === 'documents' ? 'documents' : 'others';

    const response = await config.cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Handles images, PDFs, videos, etc.
      folder: cloudinaryFolder, // Organize in Cloudinary same as local
    });

    console.log(`Uploaded to Cloudinary folder: ${cloudinaryFolder}`);
    console.log('Cloudinary URL:', response.secure_url);

    // Remove local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { url: response.secure_url };
  } catch (error: any) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { msg: error.message || 'File upload failed' };
  }
};

export default uploadFile;
