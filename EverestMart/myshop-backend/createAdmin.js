require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@everestmart.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log('✅ Existing user promoted to admin:', adminEmail);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        phone: '9999999999'
      });
      
      console.log('✅ Admin created:', admin.email);
    }
    
    console.log('\n📋 Login credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\n🔐 Login at: http://localhost:3001\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
