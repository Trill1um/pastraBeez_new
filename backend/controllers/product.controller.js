import Product from "../models/Products.js";
import cloudinary from "../lib/cloudinary.js";
import toast from "react-hot-toast"

// Function to get all products
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "colonyName messengerLink"
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
    const products = await Product.find({}).populate(
      "sellerId",
      "colonyName messengerLink"
    );
    res
      .status(200)
      .json({ products, message: "Products fetched successfully" });
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
    try {
      const uploadPromises = images.map((image) =>
        cloudinary.uploader.upload(image.base64, { folder: "bee-products" })
      );
      cloudinaryResponses = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      return res.status(500).json({ message: "Image upload failed" });
    }
    
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
    
    res.status(201).json({ product, message: "Product created successfully" });
    toast.success("Product created successfully!");
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