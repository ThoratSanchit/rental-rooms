const express = require('express');
const { body } = require('express-validator');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getOwnerRooms
} = require('../controllers/roomController');
const { auth, ownerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoom);

// Protected routes
router.use(auth);

// Owner routes (specific routes must come before parameterized routes)
router.get('/owner/my-rooms', ownerOnly, getOwnerRooms);
router.post('/', [
  ownerOnly,
  upload.array('images', 5),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('roomType').isIn(['single', 'double', 'shared', 'studio', 'apartment']).withMessage('Invalid room type'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required')
], createRoom);

router.put('/:id', ownerOnly, updateRoom);
router.delete('/:id', ownerOnly, deleteRoom);

module.exports = router;