const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const adminAuth = require('../middleware/adminAuth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    console.log('✅ Categories loaded:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    console.log('📝 Creating category:', { name, description, icon });
    
    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existing = await Category.findOne({ 
      name: new RegExp(`^${name.trim()}$`, 'i') 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Create category (slug will auto-generate)
    const category = await Category.create({ 
      name: name.trim(), 
      description: description?.trim() || '', 
      icon: icon || '📦' 
    });
    
    console.log('✅ Category created:', category.name, 'Slug:', category.slug);
    
    res.json({ success: true, category });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create category' 
    });
  }
});

// Update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;
    
    const updates = {};
    if (name) {
      updates.name = name.trim();
      // Regenerate slug
      updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    if (description !== undefined) updates.description = description;
    if (icon) updates.icon = icon;
    if (isActive !== undefined) updates.isActive = isActive;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✅ Category updated:', category.name);
    
    res.json({ success: true, category });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✅ Category deleted:', category.name);
    
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
