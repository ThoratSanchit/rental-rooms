const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceType: {
    type: String,
    enum: ['per_night', 'per_week', 'per_month'],
    default: 'per_month'
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'shared', 'studio', 'apartment'],
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'laundry', 'kitchen', 'gym', 'pool', 'ac', 'heating', 'furnished', 'pets_allowed']
  }],
  images: [{
    url: String,
    caption: String
  }],
  availability: {
    available: {
      type: Boolean,
      default: true
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    minimumStay: {
      type: Number,
      default: 1
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    showPhone: {
      type: Boolean,
      default: false
    },
    showEmail: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for location-based searches
roomSchema.index({ 'location.coordinates': '2dsphere' });
roomSchema.index({ 'location.city': 1, 'location.state': 1 });
roomSchema.index({ price: 1, roomType: 1 });

module.exports = mongoose.model('Room', roomSchema);