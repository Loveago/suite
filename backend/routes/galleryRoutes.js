const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.get('/', galleryController.getAllGalleryImages);
router.post('/', requireAdminSession, loadScopedProperty, galleryController.createGalleryImage);
router.put('/:id', requireAdminSession, loadScopedProperty, galleryController.updateGalleryImage);
router.delete('/:id', requireAdminSession, loadScopedProperty, galleryController.deleteGalleryImage);

module.exports = router;
