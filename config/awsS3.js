const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Define upload folders for different content types
const UPLOAD_FOLDERS = {
  ANIMALS: 'animals',
  SUPPLEMENTS: 'supplements',
  PROFILES: 'profiles',
  TEMP: 'temp'
};

const uploadToS3 = async (file, folder = UPLOAD_FOLDERS.TEMP) => {
  if (!file || !file.buffer) {
    throw new Error('No file or file buffer provided');
  }

  // Validate folder
  if (!Object.values(UPLOAD_FOLDERS).includes(folder)) {
    throw new Error(`Invalid folder: ${folder}. Allowed folders: ${Object.values(UPLOAD_FOLDERS).join(', ')}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${timestamp}-${randomSuffix}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${folder}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
    CacheControl: 'max-age=31536000', // 1 year cache
    Metadata: {
      originalName: file.originalname,
      uploadedBy: 'animal-marketplace',
      uploadDate: new Date().toISOString()
    }
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${folder}/${fileName}`;
    console.log(`✅ File uploaded to S3: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error(`Error uploading to S3: ${error.message}`);
  }
};

const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error('No file URL provided');
  }

  // Extract key from URL
  const urlParts = fileUrl.split('/');
  const key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`✅ File deleted from S3: ${fileUrl}`);
    return true;
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw new Error(`Error deleting from S3: ${error.message}`);
  }
};

// Helper function to get folder for different upload types
const getUploadFolder = (uploadType) => {
  switch (uploadType.toLowerCase()) {
    case 'animal':
    case 'animals':
      return UPLOAD_FOLDERS.ANIMALS;
    case 'supplement':
    case 'supplements':
      return UPLOAD_FOLDERS.SUPPLEMENTS;
    case 'profile':
    case 'profiles':
      return UPLOAD_FOLDERS.PROFILES;
    default:
      return UPLOAD_FOLDERS.TEMP;
  }
};

module.exports = { 
  s3Client, 
  uploadToS3, 
  deleteFromS3, 
  UPLOAD_FOLDERS,
  getUploadFolder
}; 