const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { uploadGalleryImages, uploadRoomImages, uploadSiteImages } = require('../controllers/uploadController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.use(requireAdminSession, loadScopedProperty);

router.post('/room-images', upload.array('images', 10), uploadRoomImages);
router.post('/gallery-images', upload.array('images', 10), uploadGalleryImages);
router.post('/site-images', upload.array('images', 10), uploadSiteImages);

module.exports = router;
