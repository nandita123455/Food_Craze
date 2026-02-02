const mongoose = require('mongoose');
const Rider = require('../models/Rider');
require('dotenv').config();

async function migrateRiderLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const riders = await Rider.find({});
    
    for (const rider of riders) {
      if (!rider.currentLocation || !rider.currentLocation.coordinates) {
        rider.currentLocation = {
          type: 'Point',
          coordinates: [0, 0] // Default location
        };
        await rider.save();
        console.log(`✅ Updated rider: ${rider.email}`);
      }
    }
    
    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateRiderLocations();
