const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings } = require('../controllers/siteSettingsController');
const { requireAdminSession } = require('../middlewares/adminAuth');

router.get('/', getSiteSettings);
router.put('/', requireAdminSession, updateSiteSettings);

module.exports = router;
