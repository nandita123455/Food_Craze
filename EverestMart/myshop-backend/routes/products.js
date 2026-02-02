const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ File upload configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// ✅ File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ✅ Get all products (public)
// ✅ Get all products
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = 0,
      maxPrice = 999999,
      rating = 0,
      inStock = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 100
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };

    if (Number(rating) > 0) {
      query.rating = { $gte: Number(rating) };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);

    // ✅ ALWAYS return this structure
    res.json({
      success: true,
      products: products,  // ✅ Must be "products" key
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products',
      products: []  // ✅ Return empty array on error
    });
  }
});

router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      categories: categories.filter(cat => cat) // Remove null/empty
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
// ✅ Get price range (min and max)
router.get('/price-range', async (req, res) => {
  try {
    const products = await Product.find({}).select('price');
    const prices = products.map(p => p.price);
    
    res.json({
      success: true,
      min: Math.min(...prices),
      max: Math.max(...prices)
    });
  } catch (error) {
    console.error('❌ Get price range error:', error);
    res.status(500).json({ error: 'Failed to fetch price range' });
  }
});


// ✅ Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Create product (admin only)
// ✅ Create product (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('📦 Creating product...');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { name, description, price, category, stock, unit, unitQuantity } = req.body;
    
    // ✅ Enhanced validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'All fields are required (name, description, price, category)' 
      });
    }
    
    // ✅ Validate category is not empty
    if (category.trim() === '') {
      return res.status(400).json({ 
        error: 'Please select a category' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }
    
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: category.trim(), // ✅ Trim whitespace
      stock: Number(stock) || 0,
      unit: unit || 'pcs',
      unitQuantity: Number(unitQuantity) || 1,
      image: `/uploads/${req.file.filename}`
    });
    
    console.log('✅ Product created:', product.name);
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ Update product (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Updating product:', req.params.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const updates = { ...req.body };
    
    // Convert to numbers
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock) updates.stock = Number(updates.stock);
    
    // Update image if new file uploaded
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ Product updated:', product.name);
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('🗑️ Deleting product:', req.params.id);
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ Product deleted:', product.name);
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
