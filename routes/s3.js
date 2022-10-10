require('dotenv').config();
const aws = require('aws-sdk')
const { nanoid } = require('nanoid')

const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
})

const generateUploadURL = async (extension) => {
    const randomID = await nanoid(8);
    const imageName = `${randomID}.${extension}`
    const params = ({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: "profile-pictures/" + imageName,
        Expires: 60
    })
        
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return {
        'url': uploadURL,
        'filename': imageName
    }
}

module.exports = { generateUploadURL }