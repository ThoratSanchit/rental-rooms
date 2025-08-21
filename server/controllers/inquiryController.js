const { validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const Room = require('../models/Room');

// Create inquiry
const createInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomId, message, moveInDate, stayDuration } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is not the owner
    if (room.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot inquire about your own room' });
    }

    const inquiry = await Inquiry.create({
      room: roomId,
      inquirer: req.user.id,
      owner: room.owner,
      message,
      moveInDate,
      stayDuration
    });

    await inquiry.populate([
      { path: 'room', select: 'title price location' },
      { path: 'inquirer', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get inquiries for owner
const getOwnerInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { owner: req.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const inquiries = await Inquiry.find(filter)
      .populate('room', 'title price location images')
      .populate('inquirer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Inquiry.countDocuments(filter);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's inquiries
const getUserInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const inquiries = await Inquiry.find({ inquirer: req.user.id })
      .populate('room', 'title price location images')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Inquiry.countDocuments({ inquirer: req.user.id });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to inquiry (owner only)
const respondToInquiry = async (req, res) => {
  try {
    const { response, status } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Check if user is the owner
    if (inquiry.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this inquiry' });
    }

    inquiry.ownerResponse = response;
    inquiry.status = status || 'responded';
    inquiry.respondedAt = new Date();

    await inquiry.save();
    await inquiry.populate([
      { path: 'room', select: 'title price location' },
      { path: 'inquirer', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInquiry,
  getOwnerInquiries,
  getUserInquiries,
  respondToInquiry
};