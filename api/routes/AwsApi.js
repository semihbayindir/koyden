import { S3 } from "aws-sdk";


//AWS

// AWS S3 konfigürasyonu
const s3 = new S3({
    accessKeyId: 'AKIAYS2NVLWJLYKFENOA',
    secretAccessKey: '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',
    region: 'eu-central-1',
  });
  
  export const uploadImageToS3 = async (imageUri, key) => {
    const params = {
      Bucket: 'koyden',
      Key: 'example.jpg',
      Body: imageUri,
      ContentType: 'image/jpeg',
    };
  
    try {
      const response = await s3.upload(params).promise();
      console.log('Upload success:', response.Location);
      return response.Location;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };