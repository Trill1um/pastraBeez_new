import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true,
    },
    isLimited: {    
        type: Boolean,
        required: [true, 'Limited edition status is required'],
        default: false
    },
    inStock: {
        type: Boolean,
        required: [true, 'Product stock is required'],
        default: true
    },
    images: [{
        type: String,
        required: [true, 'Image URL is required']
    }],
    rate_score: {
      type: Number,
      default: 0,
    },
    rate_count: {
      type: Number,
      default: 0,
    },
    additionalInfo: [{
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        }
    }],
},{timestamps: true});

productSchema.pre('findOneAndDelete', async function() {
    try {
        const productId = this.getQuery()._id;
        if (productId) {
            const P_S = mongoose.model('P_S');
            const deleteResult = await P_S.deleteMany({ productId: productId });
        }
    } catch (error) {
        console.error('Error in cascade delete middleware:', error);
    }
});

const Product = mongoose.model('Cell', productSchema);

export default Product;