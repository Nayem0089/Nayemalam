/**
 * IMAGE UPLOAD & ASSET HOSTING ROUTES (/api/upload)
 */

const express = require('express');
const multer = require('multer');
const { authenticateAdmin } = require('../middleware/auth');
const storageService = require('../services/storage.service');

const router = express.Router();

// Configure Multer (In-memory buffer for S3 / PostgreSQL stream)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum image size
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Allowed: PNG, JPEG, WEBP, GIF, SVG.'));
    }
  }
});

// POST /api/upload (ADMIN: Upload squad or tournament logo)
router.post('/', authenticateAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const publicUrl = await storageService.uploadFile(req.file);

    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded and stored permanently.'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/upload/asset/:key (Serve database-stored assets when S3 is not used)
router.get('/asset/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const asset = await storageService.getAssetByKey(key);

    if (!asset || !asset.dataBase64) {
      return res.status(404).send('Asset not found');
    }

    const matches = asset.dataBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).send('Corrupted image data');
    }

    const contentType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(imageBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
