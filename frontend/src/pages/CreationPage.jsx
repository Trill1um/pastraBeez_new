import React, { useState, useRef, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import plusIcon from "../assets/plus-sign.svg";
import {  useProcessedProducts, useProductById } from "../stores/useProductStore.js";
import compressed from "../lib/compressor.js"; // Image compression utility
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

// Additional Info Section Component - Moved outside to prevent re-creation
const AdditionalInfoSection = React.memo(
  ({ section, index, onUpdate, onRemove }) => (
    <div className="group/card relative card rounded-[25px] p-8 hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-x-8 gap-y-6 items-start">
        {/* First row: labels/text */}
        <div className="order-1 sm:order-1 space-y-2">
          <h3 className="bee-title-h6-desktop">
            Additional Info Title {index + 1}
          </h3>
          <p className="bee-body-text-desktop">
            Add extra details about your product that customers should know.
          </p>
        </div>

        <div className="order-2 sm:order-2 space-y-2">
          <h3 className="bee-title-h6-desktop">
            Additional Info Description {index + 1}
          </h3>
          <p className="bee-body-text-desktop">
            Provide detailed information about the additional feature or
            benefit.
          </p>
        </div>
        {/* Second row: input fields */}
        <div className="order-1 sm:order-3">
          <input
            type="text"
            placeholder="Enter Title Here"
            value={section.title}
            onChange={(e) => onUpdate(section._id, "title", e.target.value)}
            className="input w-full px-8 py-4 rounded-[15px] bee-body-text-desktop"
          />
        </div>

        <div className="order-2 sm:order-4">
          <textarea
            placeholder="Enter Description Here"
            rows="3"
            value={section.description}
            onChange={(e) =>
              onUpdate(section._id, "description", e.target.value)
            }
            className="input w-full px-8 py-4 rounded-[15px] bee-body-text-desktop resize-vertical min-h-32 scrollbar-hide"
          />
        </div>
      </div>
      {/* Remove Button - Only visible on hover*/}
      <button
        onClick={() => onRemove(section._id)}
        className="btn-anim absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary text-white lg:opacity-0 lg:group-hover/card:opacity-100 transform scale-75 group-hover/card:scale-100 flex items-center justify-center transition-all duration-300"
        title="Remove Section"
      >
        ✕
      </button>
    </div>
  )
);

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // base64 string
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreationPage = ({user}) => {
  const { isCreating, isUpdating, createProductAsync, updateProductAsync } = useProcessedProducts((state) => ({
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    createProductAsync: state.createProductAsync,
    updateProductAsync: state.updateProductAsync,
  }));
  
  const { id } = useParams();
  const { product } = useProductById(id.includes("creation")? "" : id.slice(8));

  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState(
    product || {
      name: "",
      description: "",
      price: "",
      category: "Food",
      images: [],
      isLimited: false,
      inStock: true,
      additionalInfo: [],
    }
  );
  // Scroll tracking state
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [imagesScrollState, setImagesScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Refs for scrollable elements
  const categoryScrollRef = useRef(null);
  const imagesScrollRef = useRef(null);

  // Drag scrolling state
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [categoryStartX, setCategoryStartX] = useState(0);
  const [imagesStartX, setImagesStartX] = useState(0);
  const [categoryScrollLeft, setCategoryScrollLeft] = useState(0);
  const [imagesScrollLeft, setImagesScrollLeft] = useState(0);

  // Categories available - using the ones from the new store
  const categories = ["Food", "Drinks", "Accessories", "Clothes", "Other"];

  // Handle scroll state for horizontal scrollable elements
  const updateScrollState = (element, setScrollState) => {
    if (!element) return;

    requestAnimationFrame(() => {
      const scrollLeft = Math.round(element.scrollLeft);
      const scrollWidth = element.scrollWidth;
      const clientWidth = element.clientWidth;
      const maxScrollLeft = scrollWidth - clientWidth;

      const canScrollLeft = scrollLeft > 8; 

      const canScrollRight = maxScrollLeft > 0 && scrollLeft < maxScrollLeft;

      setScrollState({
        canScrollLeft,
        canScrollRight,
      });
    });
  };

  // Debounce timeout refs
  const categoryScrollTimeoutRef = useRef(null);
  const imagesScrollTimeoutRef = useRef(null);

  // Handle category scroll
  const handleCategoryScroll = () => {
    if (categoryScrollRef.current) {
      // Clear previous timeout
      if (categoryScrollTimeoutRef.current) {
        clearTimeout(categoryScrollTimeoutRef.current);
      }

      // Debounce the update to handle bounce animations
      categoryScrollTimeoutRef.current = setTimeout(() => {
        updateScrollState(categoryScrollRef.current, setCategoryScrollState);
      }, 50);
    }
  };

  // Handle images scroll
  const handleImagesScroll = () => {
    if (imagesScrollRef.current) {
      // Clear previous timeout
      if (imagesScrollTimeoutRef.current) {
        clearTimeout(imagesScrollTimeoutRef.current);
      }

      // Debounce the update to handle bounce animations
      imagesScrollTimeoutRef.current = setTimeout(() => {
        updateScrollState(imagesScrollRef.current, setImagesScrollState);
      }, 50);
    }
  };

  // Simple drag scrolling handlers for categories
  const handleCategoryMouseDown = (e) => {
    setIsDraggingCategory(true);
    setCategoryStartX(e.pageX - categoryScrollRef.current.offsetLeft);
    setCategoryScrollLeft(categoryScrollRef.current.scrollLeft);
    document.body.classList.add("noselect");

    // Attach window listeners for drag
    window.addEventListener("mousemove", handleCategoryMouseMove);
    window.addEventListener("mouseup", handleCategoryMouseUp);
  };

  const handleCategoryMouseMove = (e) => {
    if (!isDraggingCategory) return;
    e.preventDefault();

    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - categoryStartX) * 1; // Normal drag speed
    categoryScrollRef.current.scrollLeft = categoryScrollLeft - walk;
  };

  const handleCategoryMouseUp = () => {
    setIsDraggingCategory(false);
    document.body.classList.remove("noselect");
    window.removeEventListener("mousemove", handleCategoryMouseMove);
    window.removeEventListener("mouseup", handleCategoryMouseUp);
  };

  // Simple drag scrolling handlers for images
  const handleImagesMouseDown = (e) => {
    setIsDraggingImages(true);
    setImagesStartX(e.pageX - imagesScrollRef.current.offsetLeft);
    setImagesScrollLeft(imagesScrollRef.current.scrollLeft);

    // Attach window listeners for drag
    window.addEventListener("mousemove", handleImagesMouseMove);
    window.addEventListener("mouseup", handleImagesMouseUp);
  };

  const handleImagesMouseMove = (e) => {
    if (!isDraggingImages) return;
    e.preventDefault();

    const x = e.pageX - imagesScrollRef.current.offsetLeft;
    const walk = (x - imagesStartX) * 1; // Normal drag speed
    imagesScrollRef.current.scrollLeft = imagesScrollLeft - walk;
  };

  const handleImagesMouseUp = () => {
    setIsDraggingImages(false);
    window.removeEventListener("mousemove", handleImagesMouseMove);
    window.removeEventListener("mouseup", handleImagesMouseUp);
  };

  // Simple wheel scrolling
  const handleCategoryWheel = (e) => {
    const scrollAmount = e.deltaY * 0.5; // Slower sensitivity
    categoryScrollRef.current.scrollLeft += scrollAmount;
  };

  const handleImagesWheel = (e) => {
    // e.preventDefault();
    const scrollAmount = (e.deltaY || e.deltaX) * 0.5; // Slower sensitivity
    imagesScrollRef.current.scrollLeft += scrollAmount;
  };

  // Initialize scroll states on mount and when images change
  useEffect(() => {
    // Use a small delay to ensure elements are fully rendered
    const initScrollStates = () => {
      if (categoryScrollRef.current) {
        updateScrollState(categoryScrollRef.current, setCategoryScrollState);
      }
      if (imagesScrollRef.current) {
        updateScrollState(imagesScrollRef.current, setImagesScrollState);
      }
    };
    // Initial check
    initScrollStates();

    // Double-check after a brief delay to ensure proper initialization
    const timeoutId = setTimeout(initScrollStates, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clear any pending debounce timeouts
      if (categoryScrollTimeoutRef.current) {
        clearTimeout(categoryScrollTimeoutRef.current);
      }
      if (imagesScrollTimeoutRef.current) {
        clearTimeout(imagesScrollTimeoutRef.current);
      }
    };
  }, [formData.images.length]); // Add dependency on images length

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      // Handle dependencies between inStock and isLimited
      if (field === "inStock" && value === false) {
        // If turning inStock OFF, also turn isLimited OFF
        return {
          ...prev,
          inStock: false,
          isLimited: false,
        };
      } else if (field === "isLimited" && value === true && !prev.inStock) {
        // If trying to turn isLimited ON but inStock is OFF, don't allow it
        return prev; // No change
      } else {
        // Normal update for all other cases
        return {
          ...prev,
          [field]: value,
        };
      }
    });
  };

  const handleImageUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true; 

    // Handle file selectionh
    fileInput.onchange = async (event) => {
      const files = Array.from(event.target.files);

      // Validate file types
      const validFiles = files.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length !== files.length) {
        alert("Only image files are allowed");
        return;
      }

      // Check if adding these files would exceed the 5 image limit
      const currentImageCount = formData.images.length;
      const totalImages = currentImageCount + validFiles.length;

      if (totalImages > 5) {
        alert(
          `You can only upload up to 5 images. Currently you have ${currentImageCount} images.`
        );
        return;
      }

      // Process the files and store image info
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const compressedFile = await compressed(file);

          return {
            id: Date.now() + Math.random(),
            name: file.name,
            url: URL.createObjectURL(compressedFile),
            base64: await fileToBase64(compressedFile),
          };
        })
      );

      // Update form data with new images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imageChanged: true,
      }));
    };

    // Trigger file selection dialog
    fileInput.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Product name is required");
        return;
      }
      if (!formData.description.trim()) {
        toast.error("Product description is required");
        return;
      }
      if (!formData.price || formData.price <= 0) {
        toast.error("Valid price is required");
        return;
      }
      if (formData.images.length === 0) {
        toast.error("At least one product image is required");
        return;
      }
      if (!product) {
        await createProductAsync(formData);
      } else {
        await updateProductAsync ({ productId: formData._id, productData: formData });
      }
      toast.success("Product created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Food",
        images: [],
        isLimited: false,
        inStock: true,
        additionalInfo: [],
      });

      // Navigate back to seller page
      navigate(`/SellerPage`);
    } catch (error) {
      toast.error("Failed to create product. Please try again.", error);
    }
  };

  // Add new additional section
  const addAdditionalSection = () => {
    const newSection = {
      _id: Date.now(), // Simple unique ID
      title: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      additionalInfo: [...prev.additionalInfo, newSection],
    }));
  };

  // Remove additional section
  const removeAdditionalSection = (sectionId) => {
    setFormData((prev) => ({
      ...prev,
      additionalInfo: prev.additionalInfo.filter(
        (section) => section._id !== sectionId
      ),
    }));
  };

  // Update additional section data
  const updateAdditionalSection = (sectionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalInfo: prev.additionalInfo.map((section) =>
        section._id === sectionId ? { ...section, [field]: value } : section
      ),
    }));
  };
  return (
    <div className={` min-h-screen w-full`}>
      {/* Bee-themed Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
        <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Main Content */}
      <div className={`${isCreating||isUpdating?"opacity-60 cursor-progress pointer-events-none":""} min-h-screen px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 xl:py-16 max-w-[1440px] mx-auto`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-2 sm:px-4 py-2 mb-2 sm:mb-4">
          <div
            className="text-primary btn-anim text-sm sm:text-base"
            onClick={() => navigate(-1)}
          >
            Seller Page
          </div>
          <span className="mx-1 sm:mx-2 text-gray-400 text-sm sm:text-base">
            &gt;
          </span>
          <span className="text-dark font-semibold text-sm sm:text-base">
            Add Product
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-16 items-stretch justify-center w-full">
          {/* Form Section */}
          <div className="w-full lg:flex-[1.5] xl:flex-[2] min-w-0 max-w-full lg:max-w-[700px] xl:max-w-[800px]">
            {/* Title */}
            <div className="mb-4 px-3 sm:px-0 sm:mb-6">
              <h1 className="bee-title-h4-desktop text-2xl sm:text-3xl lg:text-4xl">
                Add a Honey Cell
              </h1>
            </div>

            {/* Form Container */}
            <div className="card bg-white rounded-none sm:rounded-[35px] lg:rounded-[50px] p-6 md:p-8 lg:p-12 xl:p-16 shadow-lg">
              <div className="space-y-12 sm:space-y-12 lg:space-y-16">
                {/* Product Name */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row items-start lg:items-center">
                  <div className="w-full lg:flex-1 space-y-1 sm:space-y-2">
                    <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl">
                      Product Name
                    </h3>
                    <p className="bee-body-text-desktop text-sm sm:text-base">
                      Enter the name of your honey product
                    </p>
                  </div>
                  <div className="w-full lg:flex-1">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ex: Sweet Golden Honey"
                      className="input w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-[12px] bee-body-text-desktop text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Product Description */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row items-start">
                  <div className="w-full lg:flex-1 space-y-1 sm:space-y-2">
                    <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl">
                      Product Description
                    </h3>
                    <p className="bee-body-text-desktop text-sm sm:text-base">
                      Describe your product's special qualities
                    </p>
                  </div>
                  <div className="w-full lg:flex-1">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Pure honey harvested from wildflower meadows..."
                      rows="3"
                      className="input w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-[15px] bee-body-text-desktop resize-vertical min-h-[80px] sm:min-h-[100px] lg:min-h-32 scrollbar-hide text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Product Price */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row items-start lg:items-center">
                  <div className="w-full lg:flex-1 space-y-1 sm:space-y-2">
                    <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl">
                      Product Price
                    </h3>
                    <p className="bee-body-text-desktop text-sm sm:text-base">
                      Set your price in Philippine Pesos
                    </p>
                  </div>
                  <div className="w-full lg:flex-1">
                    <div className="relative">
                      <span className="absolute left-4 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 bee-body-text-desktop text-primary text-sm sm:text-base">
                        ₱
                      </span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        placeholder="250"
                        className="input w-full pl-8 sm:pl-10 lg:pl-12 pr-4 sm:pr-6 lg:pr-8 py-3 sm:py-4 rounded-[15px] bee-body-text-desktop text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Category */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row items-start">
                  <div className="flex-1 flex flex-col space-y-1 sm:space-y-2">
                    <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl">
                      Product Category
                    </h3>
                    <p className="bee-body-text-desktop text-sm sm:text-base">
                      Choose the best category for your product
                    </p>
                  </div>
                  <div className="flex-1 relative min-w-0 w-full lg:w-auto">
                    <div
                      ref={categoryScrollRef}
                      onScroll={handleCategoryScroll}
                      onWheel={handleCategoryWheel}
                      onMouseDown={handleCategoryMouseDown}
                      onMouseMove={handleCategoryMouseMove}
                      onMouseUp={handleCategoryMouseUp}
                      onMouseLeave={handleCategoryMouseUp}
                      className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide select-none"
                      style={{ scrollBehavior: "auto" }}
                    >
                      <div className="flex gap-2 sm:gap-2.5">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() =>
                              handleInputChange("category", category)
                            }
                            className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-[12px] sm:rounded-[15px] flex-shrink-0 focus:outline-none ${
                              formData.category === category
                                ? "btn-primary text-white"
                                : "bg-white btn-anim text-primary shadow-[inset_0_0_0_2px] shadow-primary"
                            }`}
                          >
                            <span className="bee-button-desktop whitespace-nowrap text-xs sm:text-sm lg:text-base">
                              {category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scroll indicators */}
                    {categoryScrollState.canScrollRight && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="bg-gradient-to-l from-white via-white/80 to-transparent w-6 sm:w-8 h-[50px] sm:h-[60px]"></div>
                      </div>
                    )}
                    {categoryScrollState.canScrollLeft && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="bg-gradient-to-r from-white via-white/80 to-transparent w-6 sm:w-8 h-[50px] sm:h-[60px]"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Images */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row items-start">
                  <div className="w-full lg:flex-1 space-y-1 sm:space-y-2">
                    <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl font-normal tracking-[-0.375px] leading-[1.3]">
                      Product Images
                    </h3>
                    <p className="bee-body-text-desktop text-sm sm:text-base font-normal tracking-[0.08px] leading-[1.5]">
                      Upload up to 5 high-quality images (
                      {formData.images.length}/5)
                    </p>
                    {formData.images.length > 0 && (
                      <div className="mt-2 px-3 py-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded text-xs sm:text-sm">
                        <strong>Note:</strong> The{" "}
                        <span className="font-bold">first image</span> will be
                        used as the product thumbnail.
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:flex-1 flex items-center justify-center flex-col sm:flex-row gap-3 sm:gap-4 min-w-0">
                    {/* Images Container - Only show if there are images */}
                    {formData.images.length > 0 && (
                      <div className="flex-3 relative min-w-0 w-full">
                        <div
                          ref={imagesScrollRef}
                          onScroll={handleImagesScroll}
                          onWheel={handleImagesWheel}
                          onMouseDown={handleImagesMouseDown}
                          onMouseMove={handleImagesMouseMove}
                          onMouseUp={handleImagesMouseUp}
                          onMouseLeave={handleImagesMouseUp}
                          className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide select-none"
                          style={{
                            scrollBehavior: "auto",
                            paddingLeft: "25px",
                            paddingRight: "25px",
                          }}
                        >
                          <div className="flex gap-2 sm:gap-3">
                            {/* Display uploaded images with snap scrolling */}
                            {formData.images.map((image, index) => (
                              <div
                                key={`image-${index}-${
                                  typeof image === "object" ? image.id : image
                                }`}
                                className="relative w-[90px] sm:w-[110px] h-[80px] sm:h-[100px] bee-grad rounded-[12px] sm:rounded-[15px] flex items-center justify-center flex-shrink-0 border-2 border-gray-200 overflow-hidden group"
                              >
                                <img
                                  src={
                                    typeof image === "object"
                                      ? image.url
                                      : image
                                  }
                                  alt={
                                    typeof image === "object"
                                      ? image.name
                                      : `Product image ${index + 1}`
                                  }
                                  className="w-full h-full object-cover rounded-[10px] sm:rounded-[13px]"
                                  draggable={false}
                                  onDragStart={(e) => e.preventDefault()}
                                />
                                {/* Remove button */}
                                <button
                                  onClick={() => {
                                    // For new uploads (objects), cleanup the object URL
                                    if (
                                      typeof image === "object" &&
                                      image.url &&
                                      image.url.startsWith("blob:")
                                    ) {
                                      URL.revokeObjectURL(image.url);
                                    }

                                    // Remove image by index to handle both cases
                                    setFormData((prev) => ({
                                      ...prev,
                                      images: prev.images.filter(
                                        (_, imgIndex) => imgIndex !== index
                                      ),
                                    }));
                                  }}
                                  className="absolute top-1 right-1 w-5 sm:w-6 h-5 sm:h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110 hover:bg-red-600"
                                >
                                  ✕
                                </button>
                                {/* Image counter */}
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scroll indicators - only show when there are multiple images */}
                        {formData.images.length > 1 && (
                          <>
                            {imagesScrollState.canScrollRight && (
                              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <div className="bg-gradient-to-l from-white via-white/80 to-transparent w-6 sm:w-8 h-[80px] sm:h-[100px] flex items-center justify-start pl-1 sm:pl-2"></div>
                              </div>
                            )}
                            {imagesScrollState.canScrollLeft && (
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <div className="bg-gradient-to-r from-white via-white/80 to-transparent w-6 sm:w-8 h-[80px] sm:h-[100px] flex items-center justify-end pr-1 sm:pr-2"></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Add Image Button - Always visible */}
                    {formData.images.length<5 &&
                      <button
                        onClick={handleImageUpload}
                        disabled={formData.images.length >= 5}
                        className={`btn-anim flex-shrink-0 btn-add px-4 sm:px-6 py-3 sm:py-4 min-h-[60px] sm:min-h-[100px] w-fit sm:w-auto ${
                          formData.images.length >= 5
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:scale-105"
                        }`}
                      >
                        <img
                          src={plusIcon}
                          alt="Add"
                          className="w-5 sm:w-6 h-5 sm:h-6 opacity-40"
                        />
                        <span className="bee-body-text-desktop text-xs sm:text-sm lg:text-base ml-2">
                          {formData.images.length === 0
                            ? "Add Images"
                            : "Add More"}
                        </span>
                      </button>
                    }
                  </div>
                </div>

                {/* Switches */}
                <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-2">
                  {/* Limited Edition Switch */}
                  <div className="relative items-start sm:items-center justify-between flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2 relative flex-1">
                      <h3
                        className={`bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl ${
                          !formData.inStock ? "opacity-50" : ""
                        }`}
                      >
                        Limited Edition?
                      </h3>
                      <p
                        className={`bee-body-text-desktop text-sm sm:text-base ${
                          !formData.inStock ? "opacity-50" : ""
                        }`}
                      >
                        Mark as limited edition product
                      </p>
                      {!formData.inStock && (
                        <span className="bee-body-text-desktop text-accent text-xs sm:text-sm mt-1 block">
                          (Requires product to be in stock)
                        </span>
                      )}
                    </div>
                    <div className="flex justify-start sm:justify-end w-full sm:w-auto">
                      <button
                        onClick={() =>
                          handleInputChange("isLimited", !formData.isLimited)
                        }
                        disabled={!formData.inStock}
                        className={`w-[70px] sm:w-[84px] h-[36px] sm:h-[42px] rounded-[20px] sm:rounded-[23px] p-1 ${
                          formData.isLimited && formData.inStock
                            ? "bg-brand"
                            : "bg-gray-400"
                        } ${
                          !formData.inStock
                            ? "opacity-50 cursor-not-allowed"
                            : "btn-anim"
                        }`}
                      >
                        <div
                          className={`w-7 sm:w-8 h-7 sm:h-8 bg-white rounded-full transition-transform ${
                            formData.isLimited && formData.inStock
                              ? "transform translate-x-8 sm:translate-x-10"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* In Stock Switch */}
                  <div className="items-start sm:items-center justify-between flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2 flex-1">
                      <h3 className="bee-title-h6-desktop text-lg sm:text-xl lg:text-2xl">
                        In Stock?
                      </h3>
                      <p className="bee-body-text-desktop text-sm sm:text-base">
                        Product availability status
                      </p>
                    </div>
                    <div className="flex justify-start sm:justify-end w-full sm:w-auto">
                      <button
                        onClick={() =>
                          handleInputChange("inStock", !formData.inStock)
                        }
                        className={`btn-anim w-[70px] sm:w-[84px] h-[36px] sm:h-[42px] rounded-[20px] sm:rounded-[23px] p-1 ${
                          formData.inStock ? "bg-brand" : "bg-gray-400"
                        }`}
                      >
                        <div
                          className={`w-7 sm:w-8 h-7 sm:h-8 bg-white rounded-full transition-transform ${
                            formData.inStock
                              ? "transform translate-x-8 sm:translate-x-10"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-300 w-full"></div>

                {/* Additional Info Sections */}
                {formData.additionalInfo.map((section, index) => (
                  <AdditionalInfoSection
                    key={section._id}
                    section={section}
                    index={index}
                    onUpdate={updateAdditionalSection}
                    onRemove={removeAdditionalSection}
                  />
                ))}

                {/* Add Section Button */}
                <div className="flex justify-center w-full px-4 sm:px-8 lg:px-16 xl:px-32">
                  <button
                    onClick={addAdditionalSection}
                    className="btn-anim btn-add px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 rounded-[15px] flex items-center gap-2"
                  >
                    <img
                      src={plusIcon}
                      alt="Add"
                      className="w-5 sm:w-6 h-5 sm:h-6 opacity-40"
                    />
                    <span className="bee-body-text-desktop text-sm sm:text-base">
                      Add Section
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Section - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block flex-1 min-w-0 max-w-full lg:max-w-[400px] xl:max-w-[500px]">
            <div className="flex flex-col h-full gap-4">
              <h2 className="bee-title-h4-desktop">Mini Live Preview</h2>
              <div className="sticky bg-white top-5 card rounded-[50px] p-6 shadow-lg flex flex-col gap-4 h-fit">
                {/* Preview Card Container - Compact size */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    <ProductCard
                      product={{
                        id: "preview-1",
                        name: formData.name || "No Name Sadge",
                        price: formData.price || "250.00",
                        category: formData.category,
                        images: formData.images || [],
                        isLimited: formData.isLimited,
                        inStock: formData.inStock,
                        description:
                          formData.description ||
                          "Pure honey harvested from wildflower meadows",
                        colonyName: user.colonyName,
                      }}
                      isPreview={true}
                    />
                  </div>
                </div>

                {/* Submit Button - Fixed at bottom */}
                <button
                  onClick={handleSubmit}
                  className="btn-anim btn-primary w-full px-16 py-4 rounded-[15px] bee-button-desktop border-2 border-dark flex-shrink-0"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Submit Button - Only visible on mobile */}
        <div className="lg:hidden mt-8 px-4">
          <button
            onClick={handleSubmit}
            className="btn-anim btn-primary w-full px-8 py-4 rounded-[15px] bee-button-desktop border-2 border-dark text-sm sm:text-base"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationPage;
