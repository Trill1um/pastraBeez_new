import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import BeeLoading from "../components/BeeLoadingScreen";
import { useProcessedProducts } from "../stores/useProductStore.js";

import DrinksIcon from "../assets/drinks.svg?react";
import FoodIcon from "../assets/burger.svg?react";
import AccessoryIcon from "../assets/accessory.svg?react";
import ClothesIcon from "../assets/hoodie.svg?react";
import OtherIcon from "../assets/other.svg?react";
import ArrowIcon from "../assets/arrow.svg?react";
import noProduct from "../assets/no_maidens.png";

// ============ FILTER CONFIGURATION ============
const FILTER_CONFIG = {
  category: {
    key: "category",
    label: "📂 Category",
    type: "select",
    options: [
      { value: null, label: "All Categories", icon: OtherIcon },
      { value: "Food", label: "Food", icon: FoodIcon },
      { value: "Drinks", label: "Drinks", icon: DrinksIcon },
      { value: "Accessories", label: "Accessories", icon: AccessoryIcon },
      { value: "Clothes", label: "Clothes", icon: ClothesIcon },
      { value: "Other", label: "Other", icon: OtherIcon },
    ],
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  inStock: {
    key: "inStock",
    label: "📦 Stock",
    type: "select",
    options: [
      { value: null, label: "All Stock States" },
      { value: true, label: "In Stock" },
      { value: false, label: "Out of Stock" },
    ],
    color: "bg-green-100 text-green-800 border-green-300",
  },
  isLimited: {
    key: "isLimited",
    label: "⭐ Availability",
    type: "select",
    options: [
      { value: null, label: "All Availability" },
      { value: true, label: "Limited Edition" },
      { value: false, label: "Regular Items" },
    ],
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
  sortBy: {
    key: "sortBy",
    label: "📊 Sort By",
    type: "select",
    options: [
      { value: "name", label: "Product Name" },
      { value: "price", label: "Price" },
      { value: "createdAt", label: "Date Created" },
    ],
  },
};

// ============ CHILD COMPONENTS ============
const SkeletonCard = () => (
  <div className="w-full min-h-[430px] bg-white rounded-[1.5rem] overflow-hidden relative">
    {/* Image skeleton */}
    <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"></div>
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title */}
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-lg w-3/4"></div>
      
      {/* Seller */}
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded w-1/2"></div>
      
      {/* Price */}
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-lg w-1/3"></div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-full w-16"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-full w-20"></div>
      </div>
      
      {/* Button */}
      <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] rounded-xl w-full"></div>
    </div>
    
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

const PageHeader = () => (
  <section className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
    <div className="max-w-[1440px] mx-auto text-center">
      <h1 className="bee-title-h4-desktop mb-4 bee-gradient-text">
        🐝 Find Your Perfect Bee Products
      </h1>
      <p
        className="bee-body-text-desktop max-w-3xl mx-auto"
        style={{ color: "var(--maroon)" }}
      >
        Welcome to the Hive. Find your worthy item from our diverse collection
        of <strong>Food</strong>, refreshing <strong>Drinks</strong>, stylish{" "}
        <strong>Accessories</strong>, cozy <strong>Clothes</strong>, and{" "}
        <strong>Other</strong> unique finds. Every purchase supports students
        and sustainable practices that help our pollinator friends thrive.
      </p>
    </div>
  </section>
);

const FilterSelect = ({
  id,
  config,
  value,
  onChange,
  whichFilterShow,
  setFilterShow,
}) => {
  //option object
  const selectedOption = config.options.find((opt) => opt.value === value);
  return (
    <div className="relative">
      {/* Label with bee styling */}
      <label className=" text-sm font-semibold mb-2 text-amber-800 flex items-center gap-2">
        {config.label}
      </label>

      {/* Custom Dropdown */}
      <div className="dropdown relative">
        <button
          onClick={() => {
            setFilterShow((state) => (state === id ? null : id));
          }}
          className={` ${
            whichFilterShow === id
              ? "ring-2  ring-amber-400 border-amber-400"
              : "border-[#f7b81a]"
          }
                w-full px-4 py-3 rounded-xl border-2 
                hover:from-amber-100 hover:via-yellow-100 hover:to-amber-100
                hover:border-amber-300
                focus:outline-none transition-all duration-300
                flex items-center justify-between
                text-left text-amber-900 font-medium
                shadow-sm hover:shadow-md
                bee-body-text-desktop
                cursor-pointer
              `}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon && (
              <selectedOption.icon className="text-amber-600 stroke-current w-4 h-4" />
            )}
            {selectedOption?.label || "Select..."}
          </div>
          <ArrowIcon
            className={`text-amber-600 stroke-current w-4 h-4 ${
              whichFilterShow === null ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {whichFilterShow === id && (
          <div
            className="
                  absolute top-full left-0 right-0 mt-2 z-50 bg-white border-2 border-amber-200 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200"
          >
            {config.options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(config.key, option.value);
                    setFilterShow(null);
                  }}
                  className={`
                          w-full text-left px-4 py-3 cursor-pointer transition-all duration-200 gap-2 flex items-center gap-2border-b border-amber-100 last:border-b-0 bee-body-text-desktop
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 text-amber-900 font-semibold"
                              : "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 hover:from-amber-100 hover:via-yellow-100 hover:to-amber-100 text-amber-800"
                          }

                          ${
                            index === 0
                              ? "rounded-t-xl"
                              : index === config.options.length - 1
                              ? "rounded-b-xl"
                              : ""
                          }
                        `}
                >
                  {option?.icon && (
                    <option.icon className="text-amber-600 stroke-current w-4 h-4" />
                  )}
                  {option.label}
                  {isSelected && (
                    <span className="ml-auto text-amber-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional: Floating bee decoration */}
      {whichFilterShow === id && (
        <div className="absolute -top-1 -right-1 text-lg animate-bounce z-50">
          🐝
        </div>
      )}
    </div>
  );
};

const ActiveFilters = ({ filters, onReset, onResetOne }) => {
  const getFilterTags = () => {
    const tags = Object.entries(FILTER_CONFIG)
      .filter(([key]) => key != "sortBy" && filters[key] !== null)
      .map(([key, config]) => {
        const option = config.options.find((opt) => opt.value === filters[key]);
        return {
          key,
          label: option?.label,
          icon: option?.icon,
          color: config.color,
        };
      });

    if (filters.searchTerm) {
      tags.push({
        key: "searchTerm",
        label: `🔍 "${filters.searchTerm}"`,
        color: "bg-amber-100 text-amber-800 border-amber-300",
      });
    }

    return tags;
  };

  const filterTags = getFilterTags();
  const hasActiveFilters = filterTags.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterTags.map((tag) => (
        <div
          onClick={() => {
            onResetOne(tag.key, tag.key === "searchTerm" ? "" : null);
          }}
          key={tag.key}
          className={`${tag.color} px-3 py-1 rounded-full text-sm border btn-anim flex items-center `}
        >
          {tag.icon && (
            <tag.icon className="inline-block w-full aspect-auto mr-1 text-current stroke-current" />
          )}

          {tag.label}
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-full text-sm bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors duration-300 btn-anim"
        >
          🔄 Reset All
        </button>
      )}
    </div>
  );
};

const FilterSection = ({ productCount }) => {
  const {
    filters,
    sort,
    labels,
    setFilter,
    setSortBy,
    toggleSortOrder,
    resetFilters,
    resetSort
  } = useProcessedProducts();

  const [showFilters, setShowFilters] = useState(false);
  const onToggleFilters = () => setShowFilters(!showFilters);
  const reset = () => {
    resetFilters();
    resetSort();
  }
  const [whichFilterShow, setFilterShow] = useState(null);

  useEffect(() => {
    const detect = (event) => {
      if (!event.target.closest(".dropdown")) setFilterShow(null);
    };
    document.addEventListener("click", detect);
    return () => {
      document.removeEventListener("click", detect);
    };
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="bg-white rounded-[1.5rem] p-4 lg:p-6 mb-6 lg:mb-8 max-w-[1440px] mx-auto shadow-lg">
        {/* Header with Toggle Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-4">
          <div>
            <h2 className="bee-title-h6-desktop mb-2">Search & Filter 🔍</h2>
            <p className="bee-body-text-desktop text-[var(--maroon)]">
              Use the tools below to find exactly what you're looking for
            </p>
          </div>

          <button
            onClick={onToggleFilters}
            className={`lg:hidden px-4 py-2 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop font-semibold ${
              showFilters ? "btn-primary" : "btn-unactive"
            }`}
          >
            {showFilters ? "🔼 Hide Filters" : "🔽 Show Filters"}
          </button>
        </div>

        {/* Filter Grid */}
        <div
          className={`transition-all duration-300 lg:max-h-none lg:opacity-100 ${
            showFilters ? "max-h-none opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input with Sort Order Button */}
            <div className="sm:col-span-2 flex-col flex justify-between lg:col-span-4">
              <label
                htmlFor="search"
                className="block text-sm font-semibold mb-2"
              >
                🔍 Search
              </label>
              <div className="flex md:flex-row flex-col gap-4">
                <input
                  id="search"
                  type="text"
                  placeholder="Search products or sellers..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilter("searchTerm", e.target.value)}
                  className="outline-none sm:flex-2 md:flex-4 px-4 py-3 rounded-[0.75rem] border-2 bg-white  bee-body-text-desktop border-[#f7b81a]"
                />
                <button
                  onClick={() => {
                    toggleSortOrder();
                  }}
                  className={`transition-all duration-300 cursor-pointer flex-1 outline-none px-3 py-3 rounded-[0.75rem] border-2 bee-body-text-desktop ${
                    sort.order != "asc" ? "btn-primary" : "btn-unactive"
                  }`}
                >
                  {labels[sort.by].direction[sort.order] || "Sort Order"}
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <FilterSelect
              id={`filter-category`}
              config={FILTER_CONFIG.category}
              value={filters.category}
              onChange={setFilter}
              whichFilterShow={whichFilterShow}
              setFilterShow={setFilterShow}
            />

            {/* Stock Filter */}
            <FilterSelect
              id={`filter-inStock`}
              config={FILTER_CONFIG.inStock}
              value={filters.inStock}
              onChange={setFilter}
              whichFilterShow={whichFilterShow}
              setFilterShow={setFilterShow}
            />

            {/* Limited Filter */}
            <FilterSelect
              id={`filter-isLimited`}
              config={FILTER_CONFIG.isLimited}
              value={filters.isLimited}
              onChange={setFilter}
              whichFilterShow={whichFilterShow}
              setFilterShow={setFilterShow}
            />

            {/* Sort By Select */}
            <FilterSelect
              id={`filter-${FILTER_CONFIG.sortBy.key}`}
              config={FILTER_CONFIG.sortBy}
              value={sort.by}
              onChange={(_, value) => setSortBy(value)}
              whichFilterShow={whichFilterShow}
              setFilterShow={setFilterShow}
            />
          </div>

          {/* Results Info & Active Filters */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p
              className="bee-body-text-desktop font-semibold"
              style={{ color: "var(--blue)" }}
            >
              🍯 Found {productCount} Honey Cells!
            </p>

            <ActiveFilters
              filters={filters}
              onReset={reset}
              onResetOne={setFilter}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductGrid = ({ products }) => {
  const { isLoading } = useProcessedProducts((state) => state.isLoading);
  // const isLoading=true;
  products = isLoading
    ? Array.from({ length: 6, _id: "placeholder-" + Date.now() })
    : products;
  return (
    <>
      {products.length ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, i) => (
            <div
              key={"product_card-" + product?._id + "-" + i}
              className="will-change-transform group bg-amber-400 rounded-[1.5rem]"
            >
              {isLoading ? (
                <SkeletonCard />
              ) : (
                <ProductCard product={product} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="gap-2 w-1/3 h-fit flex items-center justify-center flex-col">
          <img src={noProduct} className="w-1/2 aspect-auto" alt="" />
          <p className="bee-title text-2xl text-amber-900">
            No Products Available...
          </p>
        </div>
      )}
    </>
  );
};

// ============ MAIN COMPONENT ============
const Catalog = () => {
  // Use the processed products hook
  const { products, error } = useProcessedProducts();

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐝💔</div>
          <p
            className="bee-body-text-desktop"
            style={{ color: "var(--maroon)" }}
          >
            Oops! Something went wrong: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <PageHeader />

      <FilterSection productCount={products.length} />

      <main className="w-full px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="max-w-[1440px] w-full justify-center flex items-center mx-auto">
          <ProductGrid products={products} />
        </div>
      </main>
    </div>
  );
};

export default Catalog;
