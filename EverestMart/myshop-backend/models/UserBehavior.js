const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow anonymous users
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
        index: true
    },
    action: {
        type: String,
        enum: ['view', 'click', 'add_to_cart', 'remove_from_cart', 'purchase', 'wishlist', 'search', 'page_view', 'category_view', 'impression', 'activity', 'page_exit'],
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        // Additional context
        page: String, // 'home', 'products', 'product-detail', etc.
        referrer: String,
        searchQuery: String, // If action is 'search'
        category: String,
        price: Number,
        quantity: Number, // For cart/purchase actions
        deviceType: String, // 'mobile', 'desktop', 'tablet'
        location: {
            city: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
userBehaviorSchema.index({ userId: 1, timestamp: -1 });
userBehaviorSchema.index({ sessionId: 1, timestamp: -1 });
userBehaviorSchema.index({ productId: 1, action: 1 });
userBehaviorSchema.index({ action: 1, timestamp: -1 });

// Static method to track behavior
userBehaviorSchema.statics.track = async function (behaviorData) {
    try {
        // Validate ObjectId if needed
        if (behaviorData.productId && !mongoose.Types.ObjectId.isValid(behaviorData.productId)) {
            console.warn(`Skipping behavior with invalid productId: ${behaviorData.productId}`);
            return null;
        }

        const behavior = new this(behaviorData);
        await behavior.save();
        return behavior;
    } catch (error) {
        // Log error but don't crash, especially for bulk operations
        console.error('Error tracking behavior:', error.message);
        // Only rethrow if necessary, otherwise return null to allow partial success in bulk
        return null; // Return null instead of throwing to prevent Promise.all from failing completely
    }
};

// Get user's recent behaviors
userBehaviorSchema.statics.getUserHistory = async function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('productId', 'name category price image');
};

// Get product interaction stats
userBehaviorSchema.statics.getProductStats = async function (productId) {
    return this.aggregate([
        { $match: { productId: mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Get trending products (most interactions in last 24 hours)
userBehaviorSchema.statics.getTrendingProducts = async function (limit = 10) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.aggregate([
        {
            $match: {
                timestamp: { $gte: oneDayAgo },
                action: { $in: ['view', 'click', 'add_to_cart', 'purchase'] }
            }
        },
        {
            $group: {
                _id: '$productId',
                viewCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'view'] }, 1, 0] }
                },
                clickCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'click'] }, 1, 0] }
                },
                cartCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'add_to_cart'] }, 1, 0] }
                },
                purchaseCount: {
                    $sum: { $cond: [{ $eq: ['$action', 'purchase'] }, 1, 0] }
                },
                totalInteractions: { $sum: 1 }
            }
        },
        {
            $addFields: {
                score: {
                    $add: [
                        { $multiply: ['$viewCount', 1] },
                        { $multiply: ['$clickCount', 2] },
                        { $multiply: ['$cartCount', 3] },
                        { $multiply: ['$purchaseCount', 5] }
                    ]
                }
            }
        },
        { $sort: { score: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('UserBehavior', userBehaviorSchema);
