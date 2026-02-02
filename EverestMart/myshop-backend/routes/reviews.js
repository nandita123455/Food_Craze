const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ✅ Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Review.countDocuments({
      product: req.params.productId,
      status: 'approved'
    });
    
    // Calculate rating distribution
    const allReviews = await Review.find({
      product: req.params.productId,
      status: 'approved'
    }).select('rating');
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => distribution[r.rating]++);
    
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;
    
    res.json({
      success: true,
      reviews,
      stats: {
        total: allReviews.length,
        average: avgRating.toFixed(1),
        distribution
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// ✅ Add review (only if user purchased the product)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    
    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    if (!title || !comment) {
      return res.status(400).json({ error: 'Title and comment are required' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this product' });
    }
    
    // Check if user purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });
    
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      images: images || [],
      verified: !!hasPurchased,
      status: 'approved' // Auto-approve for now
    });
    
    // Update product rating
    await updateProductRating(productId);
    
    console.log(`⭐ ${req.user.email} reviewed ${product.name}: ${rating}/5`);
    
    res.json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// ✅ Update review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    review.status = 'pending'; // Re-review after edit
    await review.save();
    
    await updateProductRating(review.product);
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('❌ Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// ✅ Delete review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      user: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await updateProductRating(review.product);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ✅ Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const userIndex = review.helpful.users.indexOf(req.user._id);
    
    if (userIndex > -1) {
      // Remove vote
      review.helpful.users.splice(userIndex, 1);
      review.helpful.count--;
    } else {
      // Add vote
      review.helpful.users.push(req.user._id);
      review.helpful.count++;
    }
    
    await review.save();
    
    res.json({
      success: true,
      helpful: review.helpful.count
    });
  } catch (error) {
    console.error('❌ Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

// ✅ Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({
    product: productId,
    status: 'approved'
  }).select('rating');
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      reviewCount: reviews.length
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0
    });
  }
}

module.exports = router;
