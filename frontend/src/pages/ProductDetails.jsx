import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductById } from "../stores/useProductStore.js";
import cloudify from "../lib/cloudify.js";
import arrow from "../assets/arrow.svg";
import share from "../assets/share.svg"
import buy from "../assets/buy.svg"

const ProductDetails = () => {
  const { id } = useParams(); // 'id' matches the route param name
  const navigate = useNavigate();
  const location = useLocation();
  const { product, isLoading, error } = useProductById(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  const handleShare = () => {
    if (product) {
      navigator.share?.({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }) || alert("Product link copied to clipboard! 📋");
    }
  };

  const handleBuy = () => {
    if (product && product.sellerId && product.sellerId.facebookLink) {
      window.open("https://m.me/" + product.sellerId.facebookLink, "_blank");
    }
  };
// cloudify(product.images?.[currentImageIndex] || '', "detail", false
  useEffect(() => {
    if (product?.images?.length > 0) {
      product.images.forEach((img) => {
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
          <span className="bee-title text-brand text-xl mb-4 block">Product not found</span>
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
              className="cursor-pointer hover:scale-105 transition-transform text-blue"
            >
              {location.state?.from ? 
              location.state?.from.pathname=="/"?
                "Home Page":
                "Catalog"
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
          <div className="bg-white rounded-[1.5rem] shadow-lg lg:h-[calc(100vh)]">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Section - Fixed on Desktop */}
              <div className="lg:w-1/2 h-full flex flex-col relative bg-amber-50/30 p-4 sm:p-8">
                <div className="relative aspect-square lg:aspect-hidden lg:h-fit rounded-xl overflow-hidden bg-white shadow-md flex flex-col items-center">
                  <img
                    src={product.images?.[currentImageIndex]}
                    alt={product.name}
                    className="bee-grad  w-full aspect-square object-cover"
                  />

                  {/* Navigation Arrows */}
                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="btn-anim absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 text-blue"
                      >
                      <img src={arrow} className="-rotate-90 w-[24px] aspect-auto" alt="" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="btn-anim absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 text-blue bg-image"
                      >
                        <img src={arrow} className="rotate-90 w-[24px] aspect-auto" alt="" />
                      </button>
                    </>
                  )}

                  {/* Image Indicators */}
                  {product.images?.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
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
                {product.images?.length > 1 && (
                  <div className="mt-6 flex justify-center w-full">
                    <div className="flex gap-3">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`bee-grad w-16 h-16 rounded-lg overflow-hidden ${
                            index === currentImageIndex
                              ? "ring-2 ring-offset-2 ring-orange-500"
                              : "opacity-70 btn-anim"
                          }`}
                        >
                          <img
                            src={cloudify(image, "thumbnail", false)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info Section - Scrollable on Desktop */}
              <div className="overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 lg:w-1/2 lg:h-full rounded-[1.5rem]">
                <div className="p-4 sm:p-8 lg:p-12">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bee-tag bg-secondary text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                        {product.sellerId.colonyName||"no Name"}
                      </span>
                    </div>

                    <h1 className="bee-title text-accent text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-fredoka">
                      {product.name}
                    </h1>
                    {/* Price */}
                    <div className="bee-price text-brand text-3xl sm:text-4xl font-bold mb-6 font-fredoka">
                      &#8369; {product.price}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-6">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        product.inStock
                          ? "animate-pulse bg-inStock"
                          : "bg-noStock"
                      }`}
                    ></div>
                    <span className="bee-body text-brand font-semibold font-quicksand">
                      {product.inStock ? `In stock` : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
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

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="bee-title text-xl font-bold mb-3 text-blue font-fredoka">
                      About this Cell
                    </h3>
                    <p className="bee-body leading-relaxed text-maroon font-quicksand">
                      {product.description}
                    </p>
                  </div>

                  {/* Additional Information - Only show if info exists */}
                  {Array.isArray(product.additionalInfo) &&
                    product.additionalInfo.length > 0 && (
                      <div className="border-t border-orange/20 pt-8">
                        <h2 className="bee-title text-2xl font-bold mb-8 text-center text-blue font-fredoka">
                          🐝 More Sweet Details
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                          {product.additionalInfo.map((info, index) => (
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
                        <button
                          className="ml-2 text-blue underline hover:no-underline"
                        >
                          Refresh
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;