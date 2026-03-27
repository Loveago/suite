const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, searchPublicBookings, updateBooking } = require('../controllers/bookingController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.post('/', createBooking);
router.get('/search', searchPublicBookings);
router.get('/', requireAdminSession, loadScopedProperty, getAllBookings);
router.put('/:id', requireAdminSession, loadScopedProperty, updateBooking);

module.exports = router;
