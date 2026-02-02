const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { auth } = require('../middleware/auth');

// ✅ GET all user addresses
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log(`📍 Found ${addresses.length} addresses for user ${req.user.email}`);
    res.json(addresses);
  } catch (error) {
    console.error('❌ Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// ✅ GET single address
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    console.error('❌ Get address error:', error);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// ✅ CREATE new address
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, label, isDefault } = req.body;
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    
    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      label: label || 'Home',
      isDefault: isDefault || false
    });
    
    console.log('✅ Address created:', address._id);
    res.status(201).json(address);
  } catch (error) {
    console.error('❌ Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// ✅ UPDATE address
router.put('/:id', auth, async (req, res) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, label, isDefault } = req.body;
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: req.params.id } }, { isDefault: false });
    }
    
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { fullName, phone, addressLine1, addressLine2, city, state, pincode, label, isDefault },
      { new: true, runValidators: true }
    );
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    console.log('✅ Address updated:', address._id);
    res.json(address);
  } catch (error) {
    console.error('❌ Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// ✅ DELETE address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    console.log('✅ Address deleted:', address._id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error('❌ Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// ✅ SET default address
router.put('/:id/set-default', auth, async (req, res) => {
  try {
    // Unset all defaults
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    
    // Set new default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    console.log('✅ Default address set:', address._id);
    res.json(address);
  } catch (error) {
    console.error('❌ Set default error:', error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

module.exports = router;
