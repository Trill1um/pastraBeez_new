import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import BeeLoading from "../components/BeeLoadingScreen";
import { useProcessedProducts } from "../stores/useProductStore.js";

import DrinksIcon from "../assets/drinks.svg?react";
import FoodIcon from "../assets/burger.svg?react";
import AccessoryIcon from "../assets/accessory.svg?react";
import ClothesIcon from "../assets/hoodie.svg?react";
import OtherIcon from "../assets/other.svg?react";
import ArrowIcon from "../assets/arrow.svg?react";

// ============ FILTER CONFIGURATION ============
const FILTER_CONFIG = {
  category: {
    key: "category",
    label: "📂 Category",
    type: "select",
    options: [
      { value: null, label: "All Categories", icon:OtherIcon},
      { value: "Food", label: "Food", icon: FoodIcon  },
      { value: "Drinks", label: "Drinks", icon: DrinksIcon  },
      { value: "Accessories", label: "Accessories", icon: AccessoryIcon },
      { value: "Clothes", label: "Clothes", icon: ClothesIcon },
      { value: "Other", label: "Other", icon: OtherIcon},
    ],
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
  },
  sortBy: {
    key: "sortBy",
    label: "📊 Sort By",
    type: "select",
    options: [
      { value: "name", label: "Product Name" },
      { value: "price", label: "Price" },
      { value: "createdAt", label: "Date Created" },
      { value: "category", label: "Category" },
    ],
  },
};

// ============ CHILD COMPONENTS ============
const BeeBackground = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
    <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
    <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
    <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
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

const FilterSelect = ({ id, config, value, onChange }) => {
  const {isFilterShow, setFilterShow, toggleFilterShow}=useProcessedProducts();
  useEffect(() => {
    const detect = (event) => {
      console.log("clicked dropdown: ", !event.target.closest(".dropdown"));
      if (!event.target.closest(".dropdown")) setFilterShow(null);
    };
    document.addEventListener("click", detect);
    return () => {
      document.removeEventListener("click", detect);
    };
  }, [setFilterShow]);
  
  //option object
  const selectedOption = config.options.find(
    (opt) => (opt.value) === value
  );
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
            toggleFilterShow(id)
            console.log("id: ", id, " isFilterShow: ", isFilterShow)

          }}
          className={` ${ isFilterShow===id?"ring-2  ring-amber-400 border-amber-400": "border-[#f7b81a]"}
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
          {selectedOption?.icon && <selectedOption.icon className="text-amber-600 stroke-current w-4 h-4" />}
            {selectedOption?.label || "Select..."}
          </div>
          <ArrowIcon className={`text-amber-600 stroke-current w-4 h-4 ${isFilterShow===null? "rotate-180": ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isFilterShow===id && (
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
                    onChange(config.key, option.value)
                    toggleFilterShow(null)
                  }}
                  className={`
                          w-full text-left px-4 py-3 cursor-pointer transition-all duration-200 gap-2 flex items-center gap-2border-b border-amber-100 last:border-b-0 bee-body-text-desktop
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 text-amber-900 font-semibold"
                              : "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 hover:from-amber-100 hover:via-yellow-100 hover:to-amber-100 text-amber-800"
                          }

                          ${
                            index === 0 ? 
                              "rounded-t-xl" 
                            : index=== config.options.length - 1?      
                              "rounded-b-xl"
                            : ""
                          }
                        `}
                >
                  {option?.icon && <option.icon className="text-amber-600 stroke-current w-4 h-4" />}
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
      {isFilterShow===id && (
        <div className="absolute -top-1 -right-1 text-lg animate-bounce z-50">
          🐝
        </div>
      )}
    </div>
  );
};

const ActiveFilters = ({ filters, onReset }) => {
  const getFilterTags = () => {
    const tags = [];

    if (filters.searchTerm) {
      tags.push({
        key: "search",
        label: `🔍 "${filters.searchTerm}"`,
        color: "amber",
      });
    }

    if (filters.category !== null && filters.category !== "all") {
      const categoryOption = FILTER_CONFIG.category.options.find(
        (opt) => opt.value === filters.category
      );
      tags.push({
        key: "category",
        label: `📂 ${categoryOption?.label || filters.category}`,
        color: "blue",
      });
    }

    if (filters.inStock !== null) {
      tags.push({
        key: "inStock",
        label: `📦 ${filters.inStock ? "In Stock" : "Out of Stock"}`,
        color: "green",
      });
    }

    if (filters.isLimited !== null) {
      tags.push({
        key: "isLimited",
        label: `⭐ ${filters.isLimited ? "Limited" : "Regular"}`,
        color: "purple",
      });
    }

    return tags;
  };

  const filterTags = getFilterTags();
  const hasActiveFilters = filterTags.length > 0;

  const getTagClasses = (color) => {
    const colorClasses = {
      amber: "bg-amber-100 text-amber-800 border-amber-300",
      blue: "bg-blue-100 text-blue-800 border-blue-300",
      green: "bg-green-100 text-green-800 border-green-300",
      purple: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return `px-3 py-1 rounded-full text-sm border ${
      colorClasses[color] || colorClasses.blue
    }`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterTags.map((tag) => (
        <span key={tag.key} className={getTagClasses(tag.color)}>
          {tag.label}
        </span>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-full text-sm bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors duration-300"
        >
          🔄 Reset All
        </button>
      )}
    </div>
  );
};

const FilterSection = ({
  showFilters,
  onToggleFilters,
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onToggleSortOrder,
  onResetFilters,
  productCount,
}) => {
  const getSortLabel = () => {
    const labels = {
      price: sortOrder === "asc" ? "Low-High" : "High-Low",
      createdAt: sortOrder === "asc" ? "Old-New" : "New-Old",
      default: sortOrder === "asc" ? "A-Z" : "Z-A",
    };
    return labels[sortBy] || labels.default;
  };
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
                  onChange={(e) => onFilterChange("searchTerm", e.target.value)}
                  className="outline-none sm:flex-2 md:flex-4 px-4 py-3 rounded-[0.75rem] border-2 bg-white  bee-body-text-desktop border-[#f7b81a]"
                />
                <button
                  onClick={onToggleSortOrder}
                  className={`transition-all duration-300 cursor-pointer flex-1 outline-none px-3 py-3 rounded-[0.75rem] border-2 bee-body-text-desktop ${
                    sortOrder != "asc" ? "btn-primary" : "btn-unactive"
                  }`}
                >
                  {sortOrder === "asc" ? "⬆️" : "⬇️"} {getSortLabel()}
                </button>
              </div>
            </div>

            {/* Dynamic Filter Selects */}
            {Object.entries(FILTER_CONFIG)
              .filter(([key]) => key!="sortBy")
              .map(([key, config]) => (
                <FilterSelect
                  id={`filter-${config.key}`}
                  key={key}
                  config={config}
                  value={filters[config.key]}
                  onChange={onFilterChange}
                />
              ))}

            {/* Sort By Select */}
            <FilterSelect
              config={FILTER_CONFIG.sortBy}
              value={sortBy}
              onChange={(_, value) => onSortByChange(value)}
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

            <ActiveFilters filters={filters} onReset={onResetFilters} />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductGrid = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 lg:py-20">
        <div className="text-6xl lg:text-8xl mb-6 animate-bounce">🐝</div>
        <h3
          className="bee-title-h4-desktop mb-4"
          style={{ color: "var(--blue)" }}
        >
          No honey found in this hive!
        </h3>
        <p
          className="bee-body-text-desktop mb-8 max-w-md mx-auto"
          style={{ color: "var(--maroon)" }}
        >
          Buzz buzz... looks like our bees are still gathering products that
          match your search. Try adjusting your filters to discover more sweet
          treats!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {products.map((product) => (
        <div key={product._id} className="product-card-hover">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============
const Catalog = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Use the processed products hook
  const {
    products: filteredProducts,
    isLoading,
    error,
    filters,
    sortBy, 
    sortOrder,
    setFilter,
    setSortBy,
    toggleSortOrder,
    resetFilters,
  } = useProcessedProducts();

  // Handlers
  const handleToggleFilters = () => setShowFilters(!showFilters);
  const handleFilterChange = (key, value) => setFilter(key, value);
  const handleSortByChange = (value) => setSortBy(value);
  const handleResetFilters = () => {
    resetFilters();
    setShowFilters(false); // Hide filters on mobile after reset
  };

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
      <BeeBackground />
      <PageHeader />

      <FilterSection
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={handleFilterChange}
        onSortByChange={handleSortByChange}
        onToggleSortOrder={toggleSortOrder}
        onResetFilters={handleResetFilters}
        productCount={filteredProducts.length}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="max-w-[1440px] mx-auto">
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
    </div>
  );
};

export default Catalog;
