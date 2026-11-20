/**
 * OBJECT STORAGE SERVICE (S3 + PostgreSQL Base64 Fallback)
 * Handles permanent storage for team logos and tournament images
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const prisma = require('../prisma');

class StorageService {
  constructor() {
    this.s3Client = null;
    this.bucketName = process.env.S3_BUCKET || '';
    this.isS3Configured = false;

    // Check if S3 credentials are provided in environment
    if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET) {
      try {
        const config = {
          region: process.env.S3_REGION || 'auto',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
          }
        };

        if (process.env.S3_ENDPOINT) {
          config.endpoint = process.env.S3_ENDPOINT;
        }

        this.s3Client = new S3Client(config);
        this.isS3Configured = true;
        console.log('✅ S3 Object Storage initialized for permanent asset hosting.');
      } catch (err) {
        console.warn('⚠️ S3 initialization failed, falling back to PostgreSQL storage:', err.message);
        this.isS3Configured = false;
      }
    } else {
      console.log('ℹ️ No S3 credentials detected. Using PostgreSQL permanent storage for uploaded assets.');
    }
  }

  /**
   * Upload an image file buffer
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} Public URL of the uploaded asset
   */
  async uploadFile(file) {
    if (!file || !file.buffer) {
      throw new Error('No file buffer provided for upload.');
    }

    const ext = path.extname(file.originalname) || '.png';
    const uniqueKey = `logos/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    // 1. If S3 is configured, upload to S3 / Cloudflare R2
    if (this.isS3Configured && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueKey,
          Body: file.buffer,
          ContentType: file.mimetype
        });

        await this.s3Client.send(command);

        // Build public URL
        let publicUrl = '';
        if (process.env.S3_PUBLIC_URL) {
          publicUrl = `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${uniqueKey}`;
        } else if (process.env.S3_ENDPOINT) {
          publicUrl = `${process.env.S3_ENDPOINT.replace(/\/$/, '')}/${this.bucketName}/${uniqueKey}`;
        } else {
          publicUrl = `https://${this.bucketName}.s3.amazonaws.com/${uniqueKey}`;
        }

        // Store reference in database
        await prisma.uploadedAsset.create({
          data: {
            key: uniqueKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: publicUrl
          }
        });

        return publicUrl;
      } catch (err) {
        console.error('S3 upload error, falling back to PostgreSQL:', err);
      }
    }

    // 2. Fallback: Store permanently in PostgreSQL (Render Free Plan compatible)
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const asset = await prisma.uploadedAsset.create({
      data: {
        key: uniqueKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/api/upload/asset/${encodeURIComponent(uniqueKey)}`,
        dataBase64: base64Data
      }
    });

    return asset.dataBase64;
  }

  async getAssetByKey(key) {
    return prisma.uploadedAsset.findUnique({
      where: { key }
    });
  }
}

module.exports = new StorageService();
