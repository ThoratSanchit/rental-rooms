require('dotenv').config();
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Not needed; pre-save hook hashes
const User = require('../models/User');
const Room = require('../models/Room');

// Connect to MongoDB (use same DB as server)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-rooms');

const addSampleData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});

    // Create sample users (pass plaintext; pre-save hook will hash once)
    const owner1 = await User.create({
      name: 'John Smith',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1-555-0101',
      role: 'owner',
      isVerified: true
    });

    const owner2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      phone: '+1-555-0102',
      role: 'owner',
      isVerified: true
    });

    const renter1 = await User.create({
      name: 'Mike Wilson',
      email: 'mike@example.com',
      password: 'password123',
      phone: '+1-555-0103',
      role: 'renter',
      isVerified: true
    });

    // Create sample rooms
    const rooms = [
      {
        title: 'Cozy Studio in Downtown',
        description: 'A beautiful studio apartment in the heart of downtown. Perfect for young professionals. Features modern amenities, high-speed internet, and close to public transportation.',
        price: 1200,
        roomType: 'studio',
        location: {
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        amenities: ['wifi', 'ac', 'kitchen', 'laundry', 'parking'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            caption: 'Living area'
          }
        ],
        availability: {
          available: true,
          availableFrom: new Date(),
          leaseTerm: '6 months minimum'
        },
        owner: owner1._id
      },
      {
        title: 'Spacious Single Room with Private Bath',
        description: 'Large single room with private bathroom in a shared house. Great for students or young professionals. Includes utilities and access to common areas.',
        price: 800,
        roomType: 'single',
        location: {
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        },
        amenities: ['wifi', 'kitchen', 'laundry', 'parking'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            caption: 'Bedroom'
          }
        ],
        availability: {
          available: true,
          availableFrom: new Date(),
          leaseTerm: '3 months minimum'
        },
        owner: owner1._id
      },
      {
        title: 'Modern Double Room Near University',
        description: 'Perfect for students! Modern double room near the university campus. Fully furnished with study desk, high-speed internet, and all utilities included.',
        price: 600,
        roomType: 'double',
        location: {
          address: '789 University Drive',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101'
        },
        amenities: ['wifi', 'kitchen', 'laundry', 'furnished'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            caption: 'Study room'
          }
        ],
        availability: {
          available: true,
          availableFrom: new Date(),
          leaseTerm: 'Flexible'
        },
        owner: owner2._id
      },
      {
        title: 'Luxury Apartment Room with City View',
        description: 'Premium room in a luxury apartment building with stunning city views. Features include gym access, rooftop terrace, and concierge service.',
        price: 1800,
        roomType: 'apartment',
        location: {
          address: '321 Skyline Boulevard',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        },
        amenities: ['wifi', 'gym', 'parking', 'ac', 'furnished'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            caption: 'City view'
          }
        ],
        availability: {
          available: true,
          availableFrom: new Date(),
          leaseTerm: '12 months minimum'
        },
        owner: owner2._id
      },
      {
        title: 'Shared Room in Friendly House',
        description: 'Affordable shared room in a friendly house with international students. Great community atmosphere, shared meals, and cultural exchange opportunities.',
        price: 450,
        roomType: 'shared',
        location: {
          address: '654 Community Lane',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        amenities: ['wifi', 'kitchen', 'laundry'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            caption: 'Common area'
          }
        ],
        availability: {
          available: false,
          availableFrom: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Available in 30 days
          leaseTerm: 'Monthly'
        },
        owner: owner1._id
      },
      {
        title: 'Quiet Studio for Professionals',
        description: 'Peaceful studio apartment perfect for working professionals. Located in a quiet neighborhood with easy access to business district. Home office setup included.',
        price: 1400,
        roomType: 'studio',
        location: {
          address: '987 Professional Plaza',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101'
        },
        amenities: ['wifi', 'parking', 'furnished', 'ac'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
            caption: 'Home office'
          }
        ],
        availability: {
          available: true,
          availableFrom: new Date(),
          leaseTerm: '6 months minimum'
        },
        owner: owner2._id
      }
    ];

    await Room.insertMany(rooms);

    console.log('Sample data added successfully!');
    console.log(`Created ${await User.countDocuments()} users`);
    console.log(`Created ${await Room.countDocuments()} rooms`);
    
    // Display login credentials
    console.log('\n--- Sample Login Credentials ---');
    console.log('Owner 1: john@example.com / password123');
    console.log('Owner 2: sarah@example.com / password123');
    console.log('Renter: mike@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();