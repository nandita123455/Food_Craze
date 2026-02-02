const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (Console version - upgrade to Twilio later)
const sendOTP = async (phone, otp) => {
  console.log(`📱 OTP for ${phone}: ${otp}`);
  // For production, use Twilio:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `Your EverestMart OTP is: ${otp}. Valid for 5 minutes.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone
  // });
};

// Request OTP
exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Valid phone number required' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this phone
    await OTP.deleteMany({ phone });

    // Save new OTP
    await OTP.create({ phone, otp });

    // Send OTP
    await sendOTP(phone, otp);

    res.json({ 
      message: 'OTP sent successfully',
      phone 
    });

    console.log(`✅ OTP generated for ${phone}: ${otp}`);
  } catch (error) {
    console.error('❌ OTP request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP and login/register
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP required' });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({ phone, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      // New user - register
      user = await User.create({
        phone,
        name: name || `User${phone.slice(-4)}`,
        email: `${phone}@everestmart.com` // Placeholder email
      });
      console.log(`✅ New user registered: ${phone}`);
    } else {
      console.log(`✅ Existing user logged in: ${phone}`);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    // Delete OTP after successful verification
    await OTP.deleteMany({ phone });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        savedAddress: user.savedAddress || {}
      },
      isNewUser: !user.createdAt || (Date.now() - user.createdAt < 60000)
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
};
