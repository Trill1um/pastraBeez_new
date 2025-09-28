import cloudify from "../lib/cloudify";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
//  Assets
import accessoryIcon from "../assets/accessory.svg";
import burgerIcon from "../assets/burger.svg";
import drinksIcon from "../assets/drinks.svg";
import hoodieIcon from "../assets/hoodie.svg";
import otherIcon from "../assets/other.svg";
import heartIcon from "../assets/icon-heart.svg";
import bannerBg from "../assets/banner-bg.svg";
import placeholder from "../assets/placeholder.png";

const ProductCard = ({ product, isPreview = false }) => {
  // Function to get category icon based on product category
  const navigate = useNavigate();
  const getCategoryIcon = (category) => {
    const iconMap = {
      Food: burgerIcon,
      Drinks: drinksIcon,
      Accessories: accessoryIcon,
      Clothes: hoodieIcon,
      Other: otherIcon,
    };
    return iconMap[category] || heartIcon;
  };
  const [showOverlay, setShowOverlay] = useState(false);
  const onViewDetails = () => {
    if (isPreview) {
      setShowOverlay(true);
    } else {
      navigate(`/product/${product._id ? product._id : "preview"}`);
    }
  };

  //open messenger link in new tab
  const onBuy = () => {
    window.open(product.sellerId.facebookLink, "_blank");
  };

  return (
    <>
      <div className=" flex flex-col rounded-[1.5rem] h-full min-h-[20vh] w-full 

    transition-all duration-300 ease-out
    group-hover:-translate-y-6 -rotate-x-3
    
    "
    // hover:shadow-xl 
      // transition-all duration-300 hover:shadow-xl hover:-translate-y-2
      >
        {/* Image Section */}
        <div className="flex flex-col rounded-t-[1.5rem] overflow-hidden h-[200px] w-full relative">
          <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
            {/* Out of Stock Overlay - Always present underneath */}
            <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
              {/* Diagonal Cross Lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-accent transform rotate-45 origin-center absolute"></div>
                <div className="w-full h-0.5 bg-accent transform -rotate-45 origin-center absolute"></div>
              </div>
              {/* Out of Stock Text */}
              <div className="bg-accent px-[0.75rem] py-[0.5rem] rounded-[0.5rem] z-10">
                <p className="font-bold text-white bee-body-text-desktop">
                  OUT OF STOCK
                </p>
              </div>
            </div>

            {/* Image - Opacity changes based on stock status */}
            <img
              src={
                product.images.length
                  ? typeof product.images[0] != "object"
                    ? product.images[0]
                    : cloudify(product.images[0], "grid", isPreview)
                  : placeholder
              }
              alt={product.name || "Product"}
              className={`w-full bee-grad h-full object-cover object-center absolute inset-0 z-20 transition-opacity duration-300 ${
                product.inStock === false ? "opacity-25" : "opacity-100"
              }`}
            />
          </div>

          {/* Limited Banner */}
          {product.isLimited && product.inStock && (
            <div className="absolute top-[25px] left-0 flex items-center justify-start h-[29px] w-[186px] z-30">
              <div className="relative w-full h-full">
                <img
                  alt=""
                  className="w-full h-full object-cover object-left"
                  src={bannerBg}
                />
                <div className="absolute left-4 top-[2.5px]">
                  <p className="item-banner whitespace-pre">
                    Limited Time Only
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="bg-neutral-50 flex-1 flex flex-col gap-[2rem] p-[1.5rem] h-full rounded-b-[1.5rem]">
          {/* Product Info */}
          <div className="flex flex-col gap-2 overflow-hidden">
            {/* Product Name */}
            <h3 className="max-w-[320px] item-name truncate">{product.name}</h3>
            <div className="flex items-center justify-between h-[2rem]">
              <p className="bee-price max-w-[180px] truncate item-price">
                P{" "}
                {Number(product.price).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                  useGrouping: false,
                })}
              </p>
              <div className="bg-[#fee4a2] flex items-center gap-2.5 px-4 py-2 rounded-[15px]">
                <div className="h-fit w-fit flex items-center justify-center flex-shrink-0">
                  <img
                    alt=""
                    className="svg-maroon w-full min-h-[24px] min-w-[24px] h-full object-contain"
                    src={getCategoryIcon(product.category)}
                  />
                </div>
                <p className="item-category whitespace-nowrap">
                  {product.category}
                </p>
              </div>
            </div>
            {/* Seller Name */}
            {product.colonyName ||
              (product.sellerId.colonyName && (
                <p className="item-seller max-w-[300px] truncate">
                  {product.sellerId.colonyName || product.colonyName}
                </p>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-[2rem]">
            <button
              onClick={() => onViewDetails()}
              className="btn-anim flex-1 flex items-center justify-center px-[1rem] py-[0.75rem] rounded-[0.75rem] border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: "var(--blue)",
                backgroundColor: "transparent",
              }}
            >
              <span className="item-button" style={{ color: "var(--blue)" }}>
                Details
              </span>
            </button>

            <button
              onClick={() => onBuy()}
              className="btn-anim bg-gradient-to-r from-[#ffb009] to-[#ffd307] flex-1 flex items-center justify-center px-[1rem] py-[0.75rem] rounded-[0.75rem]"
            >
              <span className="item-button text-white">Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for product preview
      {showOverlay && (
        <div>no overlay</div>
      )} */}
    </>
  );
};

export default ProductCard;
