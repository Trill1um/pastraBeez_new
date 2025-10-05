import {
  useUserProducts,
  useProcessedProducts,
} from "../stores/useProductStore";
import cloudify from "../lib/cloudify.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BeeOverlay from "../components/Notice.jsx";

// Assets
import PlusIcon from "../assets/plus-sign.svg?react";
import DrinksIcon from "../assets/drinks.svg?react";
import FoodIcon from "../assets/burger.svg?react";
import AccessoryIcon from "../assets/accessory.svg?react";
import ClothesIcon from "../assets/hoodie.svg?react";
import OtherIcon from "../assets/other.svg?react";
import placeholder from "../assets/placeholder.png";

const SellerProducts = ({ user }) => {
  const navigate = useNavigate();
  // Icon variables - replace these with your preferred icons/assets
  const ICONS = {
    bee: "🐝",
    edit: "✏️",
    delete: "🗑️",
    Accessories: (
      <AccessoryIcon className="text-amber-600 stroke-current w-5 h-5" />
    ),
    Food: <FoodIcon className="text-amber-600 stroke-current w-5 h-5" />,
    Drinks: <DrinksIcon className="text-amber-600 stroke-current w-5 h-5" />,
    Clothes: <ClothesIcon className="text-amber-600 stroke-current w-5 h-5" />,
    Other: <OtherIcon className="text-amber-600 stroke-current w-5 h-5" />,
  };

  const { sellerProducts, isLoading, error } = useUserProducts(user?._id);
  const { deleteProductAsync, isDeleting, isCreating } = useProcessedProducts();

  // Update local products when filtered products change
  const handleEdit = (product) => {
    navigate(`/myProduct/editing-${product?._id}`);
  };

  // Bee-themed confirmation overlay state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = (productId) => {
    setConfirmDeleteId(productId);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteProductAsync(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Bee-themed confirmation overlay component

  const handleAddProduct = () => {
    navigate("/myProduct/creation");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-2xl animate-bounce">{ICONS.bee}</span>
          </div>
          <p className="text-amber-700">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-700">
            Error loading products: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-3 sm:p-6">
      <div
        className={`${
          isDeleting || isCreating
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : " pointer-events-auto opacity-100"
        } max-w-7xl mx-auto`}
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 sm:gap-8 lg:flex-row items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br bee-grad rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-2xl">{ICONS.bee}</span>
              </div>
              <div>
                <h1 className="bee-title text-xl sm:text-2xl wrap-break-word font-bold text-amber-900">
                  Your Honey Comb
                </h1>
                <p className="text-amber-700 text-xs sm:text-sm">
                  {sellerProducts.length} honey cells in total
                </p>
              </div>
            </div>
          </div>
        </div>
        {confirmDeleteId && 
          <BeeOverlay
            message={
              "Are you sure you want to remove this honey cell from your catalog?"
            }
            accept={{ fn: confirmDelete, msg: "Yes, Remove" }}
            decline={{ fn: cancelDelete, mmsg: "Cancel" }}
          />
        }
        {/* Table - Desktop & Tablet */}
        <div
          className={` hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 overflow-hidden`}
        >
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bee-grad border-b border-amber-200">
                <tr>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[8%]">
                    Image
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[25%]">
                    Product
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[15%] hidden lg:table-cell">
                    Category
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[12%]">
                    Price
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[15%] hidden xl:table-cell">
                    Stock
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-left bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[15%] hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center bee-title-text-desktop text-amber-800 uppercase tracking-wide w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="divide-y divide-amber-100">
                {sellerProducts.map((product, index) => (
                  <tr
                    key={product?._id}
                    className={`hover:bg-amber-50/50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white/50" : "bg-amber-25/25"
                    }`}
                  >
                    {/* Image */}
                    <td className="px-2 xl:px-4 py-3">
                      <div className="w-8 h-8 xl:w-12 xl:h-12 rounded-lg overflow-hidden shadow-sm border border-amber-200 mx-auto">
                        <img
                          src={
                            cloudify(product?.images[0], "thumbnail", false) ||
                            placeholder
                          }
                          alt={product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-2 xl:px-4 py-3">
                      <div className="text-accent bee-title font-medium text-gray-900 text-xs xl:text-sm wrap-break-word ">
                        {product?.name}
                      </div>
                      {/* Show category and stock info on smaller screens */}
                      <div className="flex items-center h-fit lg:hidden xl:hidden text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          {ICONS[product?.category]}
                          {product?.category}
                        </span>
                        <span className="mx-2">•</span>
                        <span
                          className={
                            product?.inStock ? "text-green-600" : "text-red-600"
                          }
                        >
                          {product?.inStock ? "In Stock" : "Out"}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-2 xl:px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-1 gap-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 truncate">
                        <span className="hidden xl:inline">
                          {ICONS[product?.category]}
                        </span>
                        <span className="truncate">{product?.category}</span>
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-2 xl:px-4 py-3">
                      <span className="text-xs xl:text-sm text-primary font-semibold text-green-700 break-words max-w-[80px]">
                        &#8369; {product?.price?.toFixed(2) || "0.00"}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-2 xl:px-4 py-3 hidden xl:table-cell">
                      <span
                        className={`text-xs font-medium ${
                          product?.inStock ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product?.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    {/* Limited */}
                    <td className="px-2 xl:px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          product?.isLimited
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            product?.isLimited ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></div>
                        <span className="xl:inline truncate">
                          {product?.isLimited ? "Limited" : "Active"}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-2 xl:px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 btn-anim text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors duration-200"
                          title="Edit product"
                        >
                          <span className="text-sm">{ICONS.edit}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product?._id)}
                          className="p-1 btn-anim text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors duration-200"
                          title="Delete product"
                        >
                          <span className="text-sm">{ICONS.delete}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State - Desktop */}
          {sellerProducts.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl text-amber-400 block mb-4">
                {ICONS.package}
              </span>
              <h3 className="bee-title text-lg font-medium text-gray-900 mb-2">
                No Honey Cells found
              </h3>
            </div>
          )}
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {sellerProducts.map((product, index) => (
            <div
              key={product?._id || product?.id || index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-4"
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-amber-200 flex-shrink-0"
                  style={{ backgroundColor: "#FFD700" }}
                >
                  <img
                    src={
                      cloudify(product?.images[0], "thumbnail", false) ||
                      placeholder
                    }
                    alt={product?.name}
                    className="aspect-square h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 sm:mb-0 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-primary bee-title font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">
                        {product?.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <span className="text-sm font-medium text-green-700 truncate max-w-1/2 flex-shrink-0">
                          ${product?.price?.toFixed(2) || "0.00"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 gap-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 truncate min-w-0">
                          <span className="flex-shrink-0">
                            {ICONS[product?.category]}
                          </span>
                          <span className="truncate">{product?.category}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`font-medium flex-shrink-0 ${
                            product?.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product?.inStock ? "In Stock" : "Out"}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span
                          className={`font-medium flex-shrink-0 ${
                            product?.isLimited
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {product?.isLimited ? "Limited" : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="hidden min-[426px]:flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-anim px-8 py-1.5 text-xs border border-blue-300 rounded-xl text-blue-700 hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product?._id)}
                        className="btn-anim px-3 py-1.5 text-xs border border-red-300 rounded-xl text-red-700 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="max-[426px]:flex hidden gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn-anim flex-1 px-3 py-2 text-sm border border-blue-300 rounded-xl text-blue-700 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product?._id)}
                      className="btn-anim flex-1 px-3 py-2 text-sm border border-red-300 rounded-xl text-red-700 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State - Mobile */}
          {sellerProducts.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl text-amber-400 block mb-4">
                {ICONS.package}
              </span>
              <h3 className="bee-title text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
            </div>
          )}
        </div>

        {/* Add Product Button */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={handleAddProduct}
            className="btn-anim w-full py-3 sm:py-4 border-2 border-dashed border-amber-300 rounded-2xl text-amber-700 font-medium bg-amber-50/50 hover:bg-amber-100/50 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <PlusIcon className="text-amber-800 stroke-current w-4 h-4" />
            Add a Honey Cell
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;
