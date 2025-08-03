# 🚀 Quick S3 Setup Checklist

## ✅ **Step 1: Create AWS S3 Bucket**

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. **Bucket name**: `animal-marketplace-images-2024` (or your choice)
4. **Region**: `us-east-1` (or closest to you)
5. **IMPORTANT**: Uncheck "Block all public access"
6. Click "Create bucket"

## ✅ **Step 2: Configure Bucket Policy**

1. Go to your bucket → "Permissions" tab
2. Click "Bucket policy"
3. Add this policy (replace `your-bucket-name`):

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

## ✅ **Step 3: Configure CORS**

1. Same "Permissions" tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit" and add:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## ✅ **Step 4: Create IAM User**

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Users → "Create user"
3. **Name**: `animal-marketplace-app`
4. **Access type**: Programmatic access
5. **Attach policy**: `AmazonS3FullAccess`
6. **SAVE** the Access Key ID and Secret Access Key!

## ✅ **Step 5: Create .env File**

Create `backend/.env` file with:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## ✅ **Step 6: Test Setup**

Run this command:

```bash
cd backend
node setup-s3.js
```

## 📁 **Folder Organization**

Your S3 bucket will automatically organize files:

- **`animals/`** - Animal photos (uploaded by users)
- **`supplements/`** - Product images (uploaded by admins)  
- **`profiles/`** - User profile pictures
- **`temp/`** - Temporary uploads

## 🎯 **Benefits of Single Bucket**

✅ **Cost Effective** - One bucket = lower costs  
✅ **Easy Management** - Single policy and CORS  
✅ **Better Organization** - Clear folder structure  
✅ **Simpler Permissions** - One IAM policy covers all  

## 🚨 **Important Notes**

- **Keep your AWS credentials secure!**
- **Never commit .env file to git**
- **Monitor your S3 costs in AWS Console**
- **Images are publicly readable** (needed for your app)

## 🔧 **Troubleshooting**

If `setup-s3.js` fails:
1. Check your AWS credentials
2. Verify bucket name in .env
3. Ensure bucket policy is set
4. Check CORS configuration
5. Verify IAM user has S3 permissions

## 📞 **Need Help?**

- Check `AWS_S3_SETUP.md` for detailed instructions
- Run `node test-s3.js` for diagnostics
- Check AWS CloudTrail for detailed logs