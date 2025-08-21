const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  inquirer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  moveInDate: {
    type: Date
  },
  stayDuration: {
    type: String,
    enum: ['short_term', 'long_term', 'flexible']
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'accepted', 'declined'],
    default: 'pending'
  },
  ownerResponse: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

// Index for efficient queries
inquirySchema.index({ owner: 1, status: 1 });
inquirySchema.index({ inquirer: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);