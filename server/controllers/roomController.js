const { validationResult } = require('express-validator');
const Room = require('../models/Room');
const User = require('../models/User');

// Get all rooms with filters
const getRooms = async (req, res) => {
  try {
    const {
      city,
      state,
      roomType,
      minPrice,
      maxPrice,
      amenities,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (roomType) filter.roomType = roomType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $in: amenitiesArray };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const rooms = await Room.find(filter)
      .populate('owner', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      data: rooms,
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

// Get single room
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'name email phone');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Increment view count
    room.views += 1;
    await room.save();

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create room (owner only)
const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const roomData = {
      ...req.body,
      owner: req.user.id
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      roomData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: ''
      }));
    }

    const room = await Room.create(roomData);
    await room.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update room (owner only)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user owns the room
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this room' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete room (owner only)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user owns the room
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get owner's rooms
const getOwnerRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getOwnerRooms
};