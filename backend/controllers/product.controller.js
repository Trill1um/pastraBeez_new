import Product from "../models/Products.js";
import P_S from "../models/P_S.js";
import cloudinary from "../lib/cloudinary.js";

// Function to get all products
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "colonyName facebookLink"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product, message: "Product fetched successfully" });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // console.log("Fetching all products. Authenticated user:", req?.user?.colonyName || "None");  
    const products = await Product.find({}).populate(
      "sellerId",
      "colonyName facebookLink"
    );

    // If user is authenticated, check which products they've rated
    let productsWithRatingFlag = products;
    if (req.user) {
      // Get all user's ratings for these products
      const userRatings = await P_S.find({ 
        userId: req.user._id,
      });
      // console.log("User ratings found:", userRatings);

      const ratedProductIds = new Set(userRatings.map(rating => rating.productId.toString()));

      productsWithRatingFlag = products.map(product => ({
        ...product.toObject(),
        userRated: ratedProductIds.has(product._id.toString())
      }));
    } else {
      productsWithRatingFlag = products.map(product => ({
        ...product.toObject(),
        userRated: false
      }));
    }

    res
      .status(200)
      .json({ products: productsWithRatingFlag, message: "Products fetched successfully" });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createMyProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images = [],
      
      //optional
      isLimited = false,
      inStock = true,
      additionalInfo = [],
    } = req.body;

    // Validate input
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let cloudinaryResponses = [];
    
    additionalInfo.forEach(element => {
      delete element._id;
    });

    // Handle image upload
    let cloudinaryTime=Date.now();
    try {
      const uploadPromises = images.map((image) =>
        cloudinary.uploader.upload(image.base64, { folder: "bee-products" })
      );
      cloudinaryResponses = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      return res.status(500).json({ message: "Image upload failed" });
    }
    cloudinaryTime-=Date.now();

    let productTime=Date.now();
    // Create new product
    const product = await Product.create({
      sellerId: req.user.id,
      name,
      description,
      price: parseFloat(price),
      category,
      isLimited,
      inStock,
      images:
      cloudinaryResponses
        ?.filter((response) => response.secure_url)
        .map((response) => response.secure_url) || [],
      additionalInfo,
    });
    productTime-=Date.now();
    res.status(201).json({ times:{cloudinaryTime, productTime}, product, message: "Product created successfully" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).populate(
      "sellerId",
      "colonyName"
    );
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }
    res
      .status(200)
      .json({ products, message: "My products fetched successfully" });
  } catch (error) {
    console.error("Error fetching my products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMyProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isLimited,
      inStock,
      images,
      additionalInfo,
      imageChanged,
    } = req.body;
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "colonyName"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this product" });
    }

    // Handle image updates
    let updatedImages = product.images || [];

    if (imageChanged && images && images.length > 0) {
      try {
        // Delete old images from Cloudinary if they exist
        if (product.images && product.images.length > 0) {
          const deletePromises = product.images.map(async (imageUrl) => {
            try {
              // Extract public_id from Cloudinary URL
              const publicId = imageUrl.split("/").pop().split(".")[0];
              const fullPublicId = `products/${publicId}`;
              await cloudinary.uploader.destroy(fullPublicId);
            } catch (deleteError) {
              console.warn(`Failed to delete image: ${imageUrl}`, deleteError);
              // Continue with update even if deletion fails
            }
          });
          await Promise.all(deletePromises);
        }

        // Upload new images to Cloudinary
        const uploadPromises = images.map((image) =>
          cloudinary.uploader.upload(
            typeof image == "object" ? image.base64 : image,
            {
              folder: "products",
              resource_type: "auto", // Handles different file types
            }
          )
        );

        const cloudinaryResponses = await Promise.all(uploadPromises);

        // Extract secure URLs from successful uploads
        updatedImages = cloudinaryResponses
          .filter((response) => response && response.secure_url)
          .map((response) => response.secure_url);

        if (updatedImages.length === 0) {
          return res
            .status(400)
            .json({ message: "No images were successfully uploaded" });
        }
      } catch (error) {
        console.error("Error handling Cloudinary images:", error);
        return res.status(500).json({ message: "Image processing failed" });
      }
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.isLimited = isLimited;
    product.inStock = inStock;
    product.images = updatedImages;
    product.additionalInfo = additionalInfo;

    await product.save();

    res.status(200).json({
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (req.user.id != product.sellerId._id) {
      return res
        .status(403)
        .json({ message: "You weeeeehjh are not authorized to delete this product" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get public IDs of images
    const publicIds = product.images.map(
      (imageUrl) => imageUrl.split("/").pop().split(".")[0]
    );

    // Delete images from Cloudinary
    try {
      const deletePromises = publicIds.map((publicId) =>
        cloudinary.uploader.destroy(`products/${publicId}`)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error);
      return res.status(500).json({ message: "Image deletion failed" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rateProduct = async(req, res) => {
  try {
    const productId = req.params?.id;
    const rating  = req.body?.rating;
    const user = req.user;
    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }
    
    // Validate rating range (assuming 1-5 stars)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // Check if product exists
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent sellers from rating their own products
    if (user?._id.toString() === product?.sellerId?._id.toString()) {
      return res.status(400).json({ message: "Sellers cannot rate their own products" });
    }
    
    const rate_result = await P_S.findOneAndUpdate(
      { productId: productId, userId: user._id },
      { $set: { rating: rating } },
      { new: false, upsert: true, runValidators: true, includeResultMetadata: true }
    );

    // If the rating was not changed, skip recalculating average
    if (rate_result && rate_result?.lastErrorObject?.updatedExisting && rate_result?.value?.rating==rating) {
      return res.status(200).json({ message: "Rating unchanged" });
    }

    const ratings = await P_S.find({ productId: productId });
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = ratings.length > 0 ? sumRatings / ratings.length : 0;

    product.rate_score = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    product.rate_count = ratings.length;
    await product.save(); 

    res.status(200).json({ message: "Product rated successfully" });
  } catch (error) {
    console.error("Error rating product:", error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

export const deleteRating = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const deletedRating = await P_S.findOneAndDelete({
      productId,
      userId: user._id,
    });

    if (!deletedRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
