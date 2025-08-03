const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 AWS S3 Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please create a .env file with the following variables:');
  console.log(`
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name
  `);
  process.exit(1);
}

// Check environment variables
console.log('🔍 Checking environment variables...');
const requiredVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_S3_BUCKET'
];

let missingVars = [];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing`);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Please add these to your .env file:');
  missingVars.forEach(varName => {
    console.log(`${varName}=your_value_here`);
  });
  process.exit(1);
}

console.log(`✅ AWS_REGION: ${process.env.AWS_REGION || 'us-east-1 (default)'}`);

// Test S3 connection
console.log('\n🧪 Testing S3 connection...');
const { uploadToS3, deleteFromS3, UPLOAD_FOLDERS } = require('./config/awsS3');

async function testS3Setup() {
  try {
    // Test file
    const testFile = {
      buffer: Buffer.from('test image data for animal marketplace'),
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg'
    };

    console.log('📤 Testing upload to animals folder...');
    const animalUrl = await uploadToS3(testFile, UPLOAD_FOLDERS.ANIMALS);
    console.log(`✅ Animal upload successful: ${animalUrl}`);

    console.log('📤 Testing upload to supplements folder...');
    const supplementUrl = await uploadToS3(testFile, UPLOAD_FOLDERS.SUPPLEMENTS);
    console.log(`✅ Supplement upload successful: ${supplementUrl}`);

    console.log('🗑️ Testing file deletion...');
    await deleteFromS3(animalUrl);
    await deleteFromS3(supplementUrl);
    console.log('✅ File deletion successful');

    console.log('\n🎉 S3 Setup Complete! Your configuration is working correctly.');
    console.log('\n📁 Your S3 bucket will organize files like this:');
    console.log(`
${process.env.AWS_S3_BUCKET}/
├── animals/          (Animal photos uploaded by users)
├── supplements/      (Product images uploaded by admins)
├── profiles/         (User profile pictures)
└── temp/            (Temporary uploads)
    `);

    console.log('\n✅ You can now:');
    console.log('   • Upload animal images via /api/cows');
    console.log('   • Upload supplement images via /api/admin/supplements/:id/images');
    console.log('   • All images will be automatically organized in the correct folders');

  } catch (error) {
    console.error('\n❌ S3 test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your AWS credentials in .env file');
    console.log('2. Verify your S3 bucket name and region');
    console.log('3. Ensure your IAM user has S3 permissions');
    console.log('4. Check if your bucket policy allows public read access');
    console.log('5. Verify CORS configuration');
    console.log('\n📖 See AWS_S3_SETUP.md for detailed setup instructions');
  }
}

testS3Setup();