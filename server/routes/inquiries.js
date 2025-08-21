const express = require('express');
const { body } = require('express-validator');
const {
  createInquiry,
  getOwnerInquiries,
  getUserInquiries,
  respondToInquiry
} = require('../controllers/inquiryController');
const { auth, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(auth);

// Create inquiry
router.post('/', [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], createInquiry);

// Get user's inquiries
router.get('/my-inquiries', getUserInquiries);

// Owner routes
router.get('/owner/inquiries', ownerOnly, getOwnerInquiries);
router.put('/:id/respond', ownerOnly, respondToInquiry);

module.exports = router;