const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, updateBooking } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getAllBookings);
router.put('/:id', updateBooking);

module.exports = router;
