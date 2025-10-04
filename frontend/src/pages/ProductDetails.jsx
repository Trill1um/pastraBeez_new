import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductById } from "../stores/useProductStore.js";
import { useUserStore } from "../stores/useUserStore.js";
import { useRateProduct } from "../lib/query.js";
import toast from "react-hot-toast";
import cloudify from "../lib/cloudify.js";
import arrow from "../assets/arrow.svg";
import share from "../assets/share.svg";
import buy from "../assets/buy.svg";
import Star from "../assets/star.svg?react";

const ProductDetails = () => {
  const { id } = useParams(); // 'id' matches the route param name
  const navigate = useNavigate();
  const location = useLocation();
  const { product, isLoading, error } = useProductById(id);
  const user = useUserStore((s) => s.user);
  const rateMutation = useRateProduct();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);
  const [isRatingExpanded, setIsRatingExpanded] = useState(false);

  // On mount
  useEffect(()=>{
    if (product?.userRated) {
      setUserRating(1);
      setTempRating(1);
    }
  },[product?.userRated])


  // Add custom animations
  const animations = `
    @keyframes slideOut {
      from {
        transform: translateX(0px);
        opacity: 0;
      }
      to {
        transform: translateX(var(--target-x));
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  const to_Back = () => {
    if (location.state?.from) navigate(-1);
    else navigate("/catalog");
  };

  // Reset image index when product changes
  useEffect(() => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [product?._id, product?.images]);

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product?.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product?.images.length) % product?.images.length
      );
    }
  };

  const handleShare = () => {
    if (product) {
      navigator.share?.({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      }) || alert("Product link copied to clipboard! 📋");
    }
  };

  const handleBuy = () => {
    if (product && product?.sellerId && product?.sellerId?.facebookLink) {
      window.open("https://m.me/" + product?.sellerId?.facebookLink, "_blank");
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating) return;

    try {
      await rateMutation.mutateAsync({
        productId: product._id,
        rating: userRating,
      });
      toast.success(`Rated ${userRating} stars! 🐝`);
      setIsRatingExpanded(false);
    } catch (error) {
      console.error("Rating failed:", error);
      toast.error("Failed to rate product. Please try again.");
    }
  };

  const handleStarClick = async (rating) => {
    // Check if user is authenticated first
    if (!user) {
      navigate("/authenticate");
      return;
    }

    // Check if user is trying to rate their own product
    if (user._id === product?.sellerId?._id) {
      toast.error("You cannot rate your own product");
      return;
    }

    // If rating is not expanded yet, expand the stars
    if (!isRatingExpanded) {
      setIsRatingExpanded(true);
      return;
    }

    // Set the new rating
    setUserRating(rating);
    setTempRating(rating);
  };

  const handleCancelRating = () => {
    setIsRatingExpanded(false);
    setUserRating(product?.userRated?1:0);
    setTempRating(product?.userRated?1:0);
  };

  useEffect(() => {
    if (product?.images?.length > 0) {
      product?.images.forEach((img) => {
        const preloadImg = new window.Image();
        preloadImg.src = cloudify(img, "detail", false);
      });
    }
  }, [product?.images]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="bee-title text-brand text-xl">Loading product...</span>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="bee-title text-brand text-xl mb-4 block">
            Product not found
          </span>
          <button
            onClick={to_Back}
            className="px-6 py-3 bg-orange text-white rounded-xl hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <style>{animations}</style>
      {/* Bee-themed Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
        <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Breadcrumb */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={to_Back}
              className="cursor-pointer hover:scale-105 transition-transform text-primary"
            >
              {location.state?.from
                ? location.state?.from.pathname == "/"
                  ? "Home Page"
                  : "Catalog"
                : "Catalog"}
            </button>
            <span className="text-orange">&gt;</span>
            <span className="text-maroon">Product Details</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-16 items-stretch justify-center h-full w-full">
            {/* Image Section - Fixed on Desktop */}
            <div className="w-full lg:w-1/3 rounded-4xl">
              <div className="lg:sticky items-center gap-4 shadow-2xl lg:top-8 lg:max-h-[calc(100vh-5rem)] w-full h-fit flex flex-col p-4 sm:p-6 bg-white rounded-4xl">
                <div className="relative aspect-square lg:aspect-square w-full rounded-xl overflow-hidden bg-white shadow-md flex flex-col items-center">
                  <img
                    src={product?.images?.[currentImageIndex]}
                    alt={product?.name}
                    className="bee-grad w-full aspect-square object-cover"
                  />

                  {/* Navigation Arrows */}
                  {product?.images?.length > 1 && (
                    <div className={`hidden lg:flex`}>
                      <button
                        onClick={prevImage}
                        className="btn-anim absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 text-blue"
                      >
                        <img
                          src={arrow}
                          className="-rotate-90 w-[24px] aspect-auto"
                          alt=""
                        />
                      </button>
                      <button
                        onClick={nextImage}
                        className="btn-anim absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 text-blue bg-image"
                      >
                        <img
                          src={arrow}
                          className="rotate-90 w-[24px] aspect-auto"
                          alt=""
                        />
                      </button>
                    </div>
                  )}

                  {/* Image Indicators */}
                  {product?.images?.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product?.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`bg-secondary w-2 h-2 rounded-full  ${
                            index === currentImageIndex
                              ? "w-6"
                              : "opacity-50 btn-anim"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Row - Centered below main image with gap, outside aspect container but inside white card */}
                {product?.images?.length > 1 && (
                  <div className="overflow-x-auto rounded-lg flex  w-fit max-w-1/1">
                    <div className="flex bg-red-100 m-1 gap-3">
                      {product?.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`bee-grad w-16 h-16 rounded-lg ${
                            index === currentImageIndex
                              ? "ring-2 ring-offset-2 ring-orange-500"
                              : "opacity-70 btn-anim"
                          }`}
                        >
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full rounded-lg object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section - Scrollable on Desktop */}
            <div className="gap-4 shadow-2xl bg-white flex flex-col lg:p-12 py-8 px-4 lg:gap-8 lg:w-1/2 lg:h-full rounded-[1.5rem]">
              <div className="gap-4 flex flex-col">
                {/* Seller Name */}
                <div className="flex items-center gap-2">
                  <span className="bee-tag bg-secondary text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                    {product?.sellerId?.colonyName || "no Name"}
                  </span>
                </div>
                {/* Product Name */}
                <h1 className="bee-title text-accent text-2xl sm:text-3xl lg:text-4xl font-bold font-fredoka">
                  {product?.name}
                </h1>
                {/* Price */}
                <div className="bee-price text-brand text-3xl sm:text-4xl font-bold font-fredoka">
                  &#8369; {product?.price}
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-3">
                  <div className="group flex gap-2 items-center">
                    <div className="flex gap-1 relative" style={{ width: isRatingExpanded ? '11rem' : '2rem', height: '2rem', transition: 'width 0.7s ease-out' }}>
                      {[1, 2, 3, 4, 5].map((star, index) => (
                        <Star
                          key={"star-"+star}
                          className={`
                            ${
                              tempRating >= star
                                ? "text-[#ffdd00]"
                                : "text-gray-300"
                            } 
                            cursor-pointer absolute hover:scale-110 hover:text-[#ffdd00] active:scale-95 w-8 h-8 transition-all duration-400 ease-in-out
                          `}
                          style={{
                            left: isRatingExpanded ? `${index * 2.25}rem` : '0px',
                            transition: `left 300ms ease-out ${
                              isRatingExpanded 
                                ? index * 0.1  
                                : (4 - index) * 0.1
                            }s, color 0.15s ease-out`,
                            zIndex: 5 - index
                          }}
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setTempRating(star)}
                          onMouseLeave={() => setTempRating(userRating)}
                        />
                      ))}
                    </div>
                    <span className="bee-body font-semibold font-quicksand text-lg text-[var(--yellow)]">
                      {product.rate_count > 0
                        ? `${product.rate_score || 0} (${product.rate_count})`
                        : "No ratings yet"}
                    </span>
                  </div>

                  {/* Rating status messages */}
                  {!user && (
                    <p className="text-sm text-gray-500">
                      Sign in to rate this product
                    </p>
                  )}
                  {user && user._id === product?.sellerId?._id && (
                    <p className="text-sm text-amber-600">
                      You can't rate your own product
                    </p>
                  )}
                  
                  {/* Show rating controls when expanded and user can rate */}
                  {isRatingExpanded && user && user._id !== product?.sellerId?._id && (
                    <div className="flex flex-col gap-2 mt-2">
                      {userRating > 0 && (
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={handleSubmitRating}
                            disabled={rateMutation.isPending}
                            className="px-3 btn-anim py-1 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                          >
                            {rateMutation.isPending ? "Submitting..." : "Submit Rating"}
                          </button>
                          <button
                            onClick={handleCancelRating}
                            className="px-3 btn-anim py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {userRating === 0 && (
                        <p className="text-sm text-black opacity-60">Click on a star to rate this product</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      product?.inStock
                        ? "animate-pulse bg-inStock"
                        : "bg-noStock"
                    }`}
                  ></div>
                  <span className="bee-body text-brand font-semibold font-quicksand">
                    {product?.inStock ? `In stock` : "Out of stock"}
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleBuy}
                    className="bee-body flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold btn-anim border-orange text-blue"
                  >
                    <img src={buy} alt="buy" />
                    Buy
                  </button>
                  <button
                    onClick={handleShare}
                    className="bee-body flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold btn-anim border-orange text-blue"
                  >
                    <img src={share} alt="share" />
                    Share
                  </button>
                </div>
              </div>
              {/* Description */}
              <div className="flex flex-col gap-3">
                <h3 className="bee-title text-xl font-bold text-blue font-fredoka">
                  About this Cell
                </h3>
                <p className="bee-body leading-relaxed text-maroon font-quicksand">
                  {product?.description}
                </p>
              </div>

              {/* Additional Information - Only show if info exists */}
              {Array.isArray(product?.additionalInfo) &&
                product?.additionalInfo.length > 0 && (
                  <div className="border-t lg:pt-8 gap-8 flex flex-col border-orange/20">
                    <h2 className="bee-title text-2xl font-bold text-center text-blue font-fredoka">
                      🐝 More Sweet Details
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {product?.additionalInfo.map((info, index) => (
                        <div
                          key={index}
                          className="p-6 rounded-xl transition-all duration-300 hover:scale-105 bg-amber-50"
                        >
                          <h4 className="bee-title text-lg font-bold mb-3 text-orange font-fredoka">
                            {info.title}
                          </h4>
                          <p className="bee-body leading-relaxed text-maroon font-quicksand">
                            {info.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* Error state indicator (if there was an error but we have cached data) */}
              {error && product && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Showing cached data. Some information might be outdated.
                    <button className="ml-2 text-blue underline hover:no-underline">
                      Refresh
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
