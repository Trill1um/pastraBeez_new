import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
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


const Product = mongoose.model('Product', productSchema);

export default Product;