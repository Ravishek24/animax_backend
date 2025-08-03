# AWS S3 Setup Guide for Image Uploads

This guide will help you set up AWS S3 for handling image uploads in your Animal Marketplace application.

## Prerequisites

1. AWS Account
2. AWS CLI (optional but recommended)
3. Node.js application with the required dependencies

## Step 1: Create an S3 Bucket

1. **Log into AWS Console**
   - Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
   - Click "Create bucket"

2. **Configure Bucket**
   - **Bucket name**: Choose a unique name (e.g., `animal-marketplace-images-2024`)
   - **Region**: Choose the region closest to your users
   - **Block Public Access**: **Uncheck** "Block all public access" (we need public read access for images)
   - **Bucket Versioning**: Disabled (for simplicity)
   - **Tags**: Optional
   - Click "Create bucket"

## Step 2: Configure Bucket Policy

1. **Go to your bucket** in the S3 console
2. **Click on "Permissions" tab**
3. **Click "Bucket policy"**
4. **Add this policy** (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

5. **Click "Save changes"**

## Step 3: Create IAM User for Application

1. **Go to IAM Console**
   - Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
   - Click "Users" → "Create user"

2. **Configure User**
   - **User name**: `animal-marketplace-app`
   - **Access type**: Programmatic access
   - Click "Next"

3. **Attach Policies**
   - Click "Attach existing policies directly"
   - Search for "AmazonS3FullAccess" and select it
   - Click "Next"

4. **Review and Create**
   - Review the settings
   - Click "Create user"

5. **Save Credentials**
   - **IMPORTANT**: Copy the Access Key ID and Secret Access Key
   - You won't be able to see the Secret Access Key again

## Step 4: Configure CORS (Cross-Origin Resource Sharing)

1. **Go back to your S3 bucket**
2. **Click on "Permissions" tab**
3. **Scroll down to "Cross-origin resource sharing (CORS)"**
4. **Click "Edit" and add this configuration**:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

5. **Click "Save changes"**

## Step 5: Environment Variables

Add these variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Step 6: Install Dependencies

Make sure you have the AWS SDK installed:

```bash
npm install aws-sdk
```

## Step 7: Test the Setup

Create a test script to verify your S3 configuration:

```javascript
// test-s3.js
const { uploadToS3 } = require('./config/awsS3');

// Test with a dummy file
const testFile = {
  buffer: Buffer.from('test image data'),
  originalname: 'test.jpg',
  mimetype: 'image/jpeg'
};

async function testS3() {
  try {
    const url = await uploadToS3(testFile, 'test');
    console.log('S3 Upload successful:', url);
  } catch (error) {
    console.error('S3 Upload failed:', error);
  }
}

testS3();
```

Run the test:
```bash
node test-s3.js
```

## Step 8: Security Best Practices

1. **Use IAM Roles** (for production)
   - Instead of access keys, use IAM roles when deploying to EC2
   - This is more secure than storing access keys

2. **Restrict Bucket Access**
   - Consider using CloudFront for better performance
   - Implement signed URLs for private content

3. **Monitor Usage**
   - Set up CloudWatch alarms for unusual activity
   - Monitor costs in AWS Cost Explorer

4. **Backup Strategy**
   - Enable versioning for important buckets
   - Set up cross-region replication if needed

## Troubleshooting

### Common Issues

1. **"Access Denied" Error**
   - Check IAM user permissions
   - Verify bucket policy
   - Ensure bucket name is correct

2. **"NoSuchBucket" Error**
   - Verify bucket name in environment variables
   - Check if bucket exists in the correct region

3. **CORS Errors**
   - Verify CORS configuration
   - Check if your domain is in allowed origins

4. **"InvalidAccessKeyId" Error**
   - Verify AWS_ACCESS_KEY_ID is correct
   - Check if the IAM user exists and is active

### Debug Commands

```bash
# Test AWS credentials
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Test bucket access
aws s3 ls s3://your-bucket-name
```

## File Structure in S3

Your images will be organized like this:

```
your-bucket-name/
├── animals/
│   ├── 1703123456789-cow1.jpg
│   ├── 1703123456790-cow2.jpg
│   └── ...
├── supplements/
│   ├── 1703123456791-vitamin-d.jpg
│   ├── 1703123456792-mineral-mix.jpg
│   └── ...
└── uploads/
    └── ...
```

## Cost Optimization

1. **Lifecycle Policies**
   - Set up automatic deletion of old files
   - Move infrequently accessed files to cheaper storage

2. **Compression**
   - Compress images before upload
   - Use appropriate image formats (WebP for web)

3. **CDN**
   - Use CloudFront for better performance
   - Reduces S3 request costs

## Monitoring

Set up CloudWatch alarms for:
- S3 request errors
- Unusual upload patterns
- Cost thresholds

## Support

If you encounter issues:
1. Check AWS CloudTrail for detailed logs
2. Review S3 access logs
3. Test with AWS CLI first
4. Check IAM permissions

## Next Steps

After setup:
1. Test image uploads from your application
2. Verify images are accessible via URLs
3. Set up monitoring and alerts
4. Consider implementing image optimization
5. Plan for backup and disaster recovery