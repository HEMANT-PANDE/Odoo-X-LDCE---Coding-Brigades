const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// 5MB limit, kept in memory (not written to disk) then streamed straight to Cloudinary.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.post('/photo', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'photo file is required' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'File must be an image' });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'globetrotter/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ url: result.secure_url });
});

module.exports = router;
