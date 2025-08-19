import fs from 'fs';
import { config } from '../config/config';

const uploadImage = async (filePath: string) => {
  try {
    if (!filePath) {
      return { msg: 'Please provide a file path' };
    }
    const response = await config.cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    console.log('response', response.url);
    fs.unlinkSync(filePath);
    return { url: response.secure_url };
  } catch (error) {
    fs.unlinkSync(filePath);
    return { msg: error };
  }
};

export default uploadImage;
