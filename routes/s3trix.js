require('dotenv').config();
const aws = require('aws-sdk')

const s3 = new aws.S3({
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
})

const generateUploadURL = async (key) => {
    
    const params = ({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: 60
    })
        
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return uploadURL
}

module.exports = { generateUploadURL }