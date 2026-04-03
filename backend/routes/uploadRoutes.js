const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { uploadGalleryImages, uploadRoomImages, uploadSiteImages } = require('../controllers/uploadController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.use(requireAdminSession, loadScopedProperty);

const handleUploadError = (err, _req, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Each image must be 10MB or smaller' });
    }

    return res.status(400).json({ error: err.message || 'Upload failed' });
  }

  return res.status(400).json({ error: err.message || 'Upload failed' });
};

router.post('/room-images', upload.array('images', 10), uploadRoomImages);
router.post('/gallery-images', upload.array('images', 10), uploadGalleryImages);
router.post('/site-images', upload.array('images', 10), uploadSiteImages);
router.use(handleUploadError);

module.exports = router;
