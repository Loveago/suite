const express = require('express');
const router = express.Router();
const { getAllProperties } = require('../controllers/propertyController');

router.get('/', getAllProperties);

module.exports = router;
