const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Can be null for anonymous users
        index: true
    },
    startTime: {
        type: Date,
        default: Date.now,
        index: true
    },
    endTime: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    deviceInfo: {
        userAgent: String,
        browser: String,
        os: String,
        device: String, // 'mobile', 'desktop', 'tablet'
        screenResolution: String
    },
    location: {
        ip: String,
        city: String,
        region: String,
        country: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    statistics: {
        pageViews: { type: Number, default: 0 },
        productViews: { type: Number, default: 0 },
        cartAdditions: { type: Number, default: 0 },
        purchases: { type: Number, default: 0 },
        searchQueries: { type: Number, default: 0 }
    },
    referrer: String,
    landingPage: String,
    exitPage: String
}, {
    timestamps: true
});

// Auto-expire sessions after 30 minutes of inactivity
userSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });

// Static method to create or get active session
userSessionSchema.statics.createOrGetSession = async function (sessionId, data = {}) {
    try {
        return await this.findOneAndUpdate(
            { sessionId },
            {
                $setOnInsert: {
                    ...data,
                    isActive: true,
                    startTime: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
    } catch (error) {
        console.error('Error in createOrGetSession:', error);
        // Fallback: try to find it if upsert failed (rare edge case with race conditions on unique index)
        return this.findOne({ sessionId });
    }
};

// Update session statistics
userSessionSchema.methods.updateStats = async function (action) {
    const statMap = {
        'view': 'pageViews',
        'click': 'productViews',
        'add_to_cart': 'cartAdditions',
        'purchase': 'purchases',
        'search': 'searchQueries'
    };

    const statField = statMap[action];
    if (statField) {
        this.statistics[statField] += 1;
        await this.save();
    }
};

// End session
userSessionSchema.methods.endSession = async function (exitPage) {
    this.isActive = false;
    this.endTime = new Date();
    if (exitPage) {
        this.exitPage = exitPage;
    }
    await this.save();
};

// Get session duration in seconds
userSessionSchema.virtual('duration').get(function () {
    const end = this.endTime || new Date();
    return Math.floor((end - this.startTime) / 1000);
});

// Get active sessions count
userSessionSchema.statics.getActiveSessions = async function () {
    return this.countDocuments({ isActive: true });
};

module.exports = mongoose.model('UserSession', userSessionSchema);
