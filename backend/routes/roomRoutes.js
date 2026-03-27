const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { loadScopedProperty, requireAdminSession } = require('../middlewares/adminAuth');

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', requireAdminSession, loadScopedProperty, createRoom);
router.put('/:id', requireAdminSession, loadScopedProperty, updateRoom);
router.delete('/:id', requireAdminSession, loadScopedProperty, deleteRoom);

module.exports = router;
