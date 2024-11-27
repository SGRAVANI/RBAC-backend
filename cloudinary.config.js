import { v2 as cloudinary }  from "cloudinary";

cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


export const uploadToCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(filePath, { folder: 'uploads' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.url);  // The Cloudinary URL
        }
      });
    });
  };
  