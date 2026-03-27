const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { uploadRoomImages } = require('../controllers/uploadController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.use(requireAdminSession, loadScopedProperty);

router.post('/room-images', upload.array('images', 10), uploadRoomImages);

module.exports = router;
