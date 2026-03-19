const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { uploadRoomImages } = require('../controllers/uploadController');

router.post('/room-images', upload.array('images', 10), uploadRoomImages);

module.exports = router;
