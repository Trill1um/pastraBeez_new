import P_S from "../models/P_S.js";
import Product from "../models/Products.js"; // Import your Product model

export const rate = async (req, res) => {
  try {
    const { user, productID, rating } = req.body;
    
    if (!user || !productID || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate rating range (assuming 1-5 stars)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already rated this product
    const existingRating = await P_S.findOne({ 
      sellerId: user._id, 
      productID 
    });

    let newRating;
    let isUpdate = false;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      newRating = await existingRating.save();
      isUpdate = true;
    } else {
      // Create new rating
      newRating = await P_S.create({
        sellerId: user._id,
        productID,
        rating
      });
    }

    // Now update the product's overall rating
    await updateProductRating(productID);

    res.status(201).json({ 
      message: isUpdate ? "Rating updated successfully" : "Rating submitted successfully", 
      newRating 
    });
    
  } catch (error) {
    console.error("Error rating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Helper function to calculate and update product's overall rating
const updateProductRating = async (productID) => {
  try {
    // Get all ratings for this product
    const ratings = await P_S.find({ productID });
    
    if (ratings.length === 0) {
      // No ratings, set to 0
      await Product.findByIdAndUpdate(productID, {
        rating: 0,
        ratingCount: 0
      });
      return;
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Update product with new rating and count
    await Product.findByIdAndUpdate(productID, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingCount: ratings.length
    });

  } catch (error) {
    console.error("Error updating product rating:", error);
    throw error;
  }
};