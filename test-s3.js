const { uploadToS3, deleteFromS3 } = require('./config/awsS3');

// Test with a dummy file
const testFile = {
  buffer: Buffer.from('test image data'),
  originalname: 'test.jpg',
  mimetype: 'image/jpeg'
};

async function testS3() {
  console.log('Testing S3 Configuration...\n');
  
  try {
    // Test upload
    console.log('1. Testing file upload...');
    const uploadUrl = await uploadToS3(testFile, 'test');
    console.log('✅ Upload successful:', uploadUrl);
    
    // Test delete
    console.log('\n2. Testing file deletion...');
    await deleteFromS3(uploadUrl);
    console.log('✅ Delete successful');
    
    console.log('\n🎉 All S3 tests passed! Your configuration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ S3 test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your AWS credentials in .env file');
    console.log('2. Verify your S3 bucket name and region');
    console.log('3. Ensure your IAM user has S3 permissions');
    console.log('4. Check if your bucket policy allows public read access');
    console.log('5. Verify CORS configuration');
  }
}

// Check environment variables
console.log('Environment Variables Check:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET ? '✅ Set' : '❌ Missing');
console.log('');

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
  console.log('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

testS3();