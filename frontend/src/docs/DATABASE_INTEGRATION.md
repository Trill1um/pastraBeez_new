# Database Integration Guide for PastraBeez Catalog 🐝

## 📊 **Your Current Setup (Working)**

Your product grid is **already dynamic** and dependent on `mockProducts`. Here's what you have:

### ✅ **Current Dynamic Features:**
- **Grid adapts to product count**: Automatically creates cards based on array length
- **Real-time filtering**: Search, category, and sort filters work dynamically
- **Responsive layout**: Grid adjusts to screen sizes automatically
- **State management**: Uses React state for dynamic updates

### 📝 **Current Data Flow:**
```javascript
mockProducts (8 items) 
    ↓ 
filteredProducts (dynamic based on filters)
    ↓
Grid renders {filteredProducts.length} cards
```

---

## 🔗 **Integrating Your MongoDB Database**

### **Step 1: Backend API Endpoints (Your Express Server)**

Update your `backend/routes/product.route.js` to include these endpoints:

````javascript
// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sortBy = 'name', 
      page = 1, 
      limit = 50 
    } = req.query;

    // Build query object
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { seller: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort.price = 1;
        break;
      case 'price-high':
        sort.price = -1;
        break;
      case 'seller':
        sort.seller = 1;
        break;
      case 'likes':
        sort.likes = -1;
        break;
      default:
        sort.name = 1;
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Product.countDocuments(query);
    const categories = await Product.distinct('category');

    res.json({
      products,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      categories
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});
````

### **Step 2: Update Your Product Model (MongoDB Schema)**

Make sure your `backend/models/Products.js` matches your frontend expectations:

````javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  seller: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,  // Store as number, format in frontend
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['honey', 'wax products', 'beauty', 'health', 'other']
  },
  likes: {
    type: Number,
    default: 0
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  description: String,
  inStock: {
    type: Boolean,
    default: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  }
}, {
  timestamps: true
});
````

### **Step 3: Replace Mock Data in Your Catalog**

Update your existing `Catalog.jsx` to use the database:

````javascript
import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/productService';

export default function Catalog() {
  // Replace mockProducts with database state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // Your existing filter states stay the same
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Fetch products from database on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await ProductService.getAllProducts({
          search: searchTerm,
          category: selectedCategory,
          sortBy: sortBy,
          limit: 50
        });
        
        setProducts(data.products);
        setTotalCount(data.totalCount);
        setCategories(data.categories);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]); // Refetch when filters change

  // Your existing filtering logic stays the same
  useEffect(() => {
    setFilteredProducts(products); // Since filtering is done server-side
  }, [products]);

  // Your existing handlers with database integration
  const handleAddToCart = async (productId, productName) => {
    try {
      await ProductService.addToCart(productId, 1);
      alert(`Added ${productName} to your hive! 🍯`);
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  // Add loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🐝</div>
          <p className="text-lg">Loading sweet products...</p>
        </div>
      </div>
    );
  }

  // Add error state  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-lg mb-4">Failed to load products: {error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component stays exactly the same!
  // Just use {filteredProducts.map()} as you already do
}
````

### **Step 4: Expected Database Product Format**

Your MongoDB products should match this structure:

````javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Golden Honey Jar",
  "seller": "BeeKeeper Co.",
  "price": 250,  // Number, not string
  "category": "honey",
  "likes": 124,
  "isLimited": true,
  "images": [
    "https://res.cloudinary.com/.../honey1.jpg",
    "https://res.cloudinary.com/.../honey2.jpg"
  ],
  "description": "Pure golden honey from mountain bees",
  "inStock": true,
  "sellerId": "507f1f77bcf86cd799439012",
  "createdAt": "2025-08-19T...",
  "updatedAt": "2025-08-19T..."
}
````

---

## 🎯 **Migration Steps**

### **Phase 1: Prepare Backend**
1. ✅ Add the API endpoints above to your backend
2. ✅ Test endpoints with Postman/Thunder Client
3. ✅ Seed database with some sample products

### **Phase 2: Update Frontend Service**
1. ✅ Use the `ProductService` class I created
2. ✅ Test API calls from frontend

### **Phase 3: Replace Mock Data**
1. ✅ Replace `mockProducts` import with `ProductService.getAllProducts()`
2. ✅ Add loading and error states
3. ✅ Update handlers to use product IDs

### **Phase 4: Enhanced Features**
1. 🔄 Add pagination for large product lists
2. 🔄 Add server-side filtering for better performance  
3. 🔄 Add cart functionality
4. 🔄 Add product favorites/wishlist

---

## 🚀 **Benefits of Database Integration**

### **Current (Mock Data)**:
- ✅ Fast development
- ✅ Predictable data
- ❌ Limited to 8 products
- ❌ No persistence
- ❌ No real-time updates

### **With Database**:
- ✅ **Unlimited products** - Grid adapts automatically
- ✅ **Real-time updates** - Add products, they appear instantly
- ✅ **Advanced filtering** - Server-side performance
- ✅ **User-generated content** - Sellers can add products
- ✅ **Analytics** - Track views, sales, popular items
- ✅ **Search functionality** - Full-text search across all fields

---

## 📊 **Performance Considerations**

### **Client-Side Filtering (Current)**
```javascript
// Good for small datasets (< 100 products)
filteredProducts = products.filter(product => 
  product.name.includes(searchTerm)
);
```

### **Server-Side Filtering (Recommended)**
```javascript
// Better for large datasets (> 100 products)
const data = await ProductService.getAllProducts({
  search: searchTerm,
  category: selectedCategory,
  page: currentPage
});
```

---

## 🔧 **Testing Your Integration**

### **1. Test Backend Endpoints**
```bash
# Get all products
curl http://localhost:5000/api/products

# Search products
curl "http://localhost:5000/api/products?search=honey&category=honey&sortBy=price-low"

# Get categories
curl http://localhost:5000/api/products/categories
```

### **2. Test Frontend Service**
```javascript
// In browser console
import { ProductService } from './services/productService';

ProductService.getAllProducts()
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Error:', err));
```

### **3. Seed Your Database**
```javascript
// Seed script to add sample products
const sampleProducts = [
  {
    name: "Golden Honey Jar",
    seller: "BeeKeeper Co.", 
    price: 250,
    category: "honey",
    likes: 124,
    isLimited: true,
    sellerId: "your-seller-id"
  }
  // ... more products
];

// Insert into MongoDB
await Product.insertMany(sampleProducts);
```

---

## 🎯 **Next Steps**

1. **Start with 1-2 endpoints** - Don't build everything at once
2. **Test each piece** - API → Service → Component
3. **Keep your mock data** as fallback during development
4. **Add error handling** for network issues
5. **Consider caching** for frequently accessed data

Your grid is **already perfect** for database integration - it's fully dynamic and responsive! 🐝✨
