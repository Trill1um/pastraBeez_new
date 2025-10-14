import mongoose  from "mongoose";

const p_sSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DummySeller',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DummyData',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

},{timestamps: true});

// Middleware to recalculate product rating when a rating is deleted
p_sSchema.pre('findOneAndDelete', async function() {
    try {
        // Get the rating document that will be deleted
        const ratingToDelete = await this.model.findOne(this.getQuery());
        
        if (ratingToDelete && ratingToDelete.productId) {
            const productId = ratingToDelete.productId;
            
            // Import Product model (avoid circular dependency)
            const Product = mongoose.model('DummyData');
            
            // Get all remaining ratings for this product (excluding the one being deleted)
            const remainingRatings = await this.model.find({ 
                productId: productId,
                _id: { $ne: ratingToDelete._id }
            });
            
            // Calculate new average and count
            const totalRatings = remainingRatings.length;
            const sumRatings = remainingRatings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
            
            // Update the product with new rating stats
            await Product.findByIdAndUpdate(productId, {
                rate_score: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                rate_count: totalRatings
            });
            
            // console.log(`Rating deleted: Updated product ${productId} - new average: ${averageRating}, count: ${totalRatings}`);
        }
    } catch (error) {
        console.error('Error in rating delete middleware:', error);
        // Don't throw error to prevent blocking the rating deletion
    }
});

const P_S = mongoose.model('Rating', p_sSchema);

export default P_S;