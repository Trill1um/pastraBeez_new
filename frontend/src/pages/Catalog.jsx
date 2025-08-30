import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import BeeLoading from "../components/BeeLoadingScreen";
import { useProcessedProducts } from "../stores/useProductStore.js";

// ============ CONSTANTS ============
const categories = [
  { value: "all", label: "All Categories" },
  { value: "Food", label: "Food" },
  { value: "Drinks", label: "Drinks" },
  { value: "Accessories", label: "Accessories" },
  { value: "Clothes", label: "Clothes" },
  { value: "Other", label: "Other" },
];

const sortOptions = [
  { value: "name", label: "Product Name" },
  { value: "price", label: "Price" },
  { value: "createdAt", label: "Date Created" },
  { value: "category", label: "Category" },
];

const stockStates = [
  { value: null, label: "All Stock States" },
  { value: true, label: "In Stock" },
  { value: false, label: "Out of Stock" },
];

const limitedStates = [
  { value: null, label: "All Availability" },
  { value: true, label: "Limited Edition" },
  { value: false, label: "Regular Items" },
];

const Catalog = () => {
  // Toggle state for mobile filters
  const [showFilters, setShowFilters] = useState(false);

  // Use the new combined hook instead of separate state and store
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
    resetFilters: resetProcessorFilters,
  } = useProcessedProducts();

  // Custom reset function to match your UI expectations
  const resetFilters = () => {
    resetProcessorFilters();
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Loading state
  if (isLoading) {
    return <BeeLoading />;
  }

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
      {/* Bee-themed Background - Same as CreationPage */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
        <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Page Introduction - Above Filters */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <h1 className="bee-title-h4-desktop mb-4 bee-gradient-text">
            🐝 Find Your Perfect Bee Products
          </h1>
          <p
            className="bee-body-text-desktop max-w-3xl mx-auto"
            style={{ color: "var(--maroon)" }}
          >
            Welcome to the Hive. Find your worthy item from our diverse
            collection of <strong>Food</strong>, refreshing{" "}
            <strong>Drinks</strong>, stylish <strong>Accessories</strong>, cozy{" "}
            <strong>Clothes</strong>, and <strong>Other</strong> unique finds.
            Every purchase supports students and sustainable practices that help
            our pollinator friends thrive.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white rounded-[1.5rem] p-4 lg:p-6 mb-6 lg:mb-8 max-w-[1440px] mx-auto shadow-lg">
          {/* Header with Toggle Button (mobile only) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-4">
            <div>
              <h2
                className="bee-title-h6-desktop mb-2"
                style={{ color: "var(--blue)" }}
              >
                Search & Filter 🔍
              </h2>
              <p
                className="bee-body-text-desktop"
                style={{ color: "var(--maroon)" }}
              >
                Use the tools below to find exactly what you're looking for
              </p>
            </div>

            {/* Toggle Button - Only visible on mobile/tablet */}
            <button
              onClick={toggleFilters}
              className="lg:hidden px-4 py-2 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop font-semibold"
              style={{
                borderColor: "var(--orange)",
                backgroundColor: showFilters ? "var(--orange)" : "white",
                color: showFilters ? "white" : "var(--blue)",
              }}
            >
              {showFilters ? "🔼 Hide Filters" : "🔽 Show Filters"}
            </button>
          </div>

          {/* Filter Grid - Always visible on desktop, toggleable on mobile */}
          <div
            className={`transition-all duration-300 overflow-hidden lg:max-h-none lg:opacity-100 ${
              showFilters ? "max-h-none opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* 1. Search */}
              <div className="sm:col-span-2 flex items-end gap-8 justify-between xl:col-span-2">
                <div className="flex-1">
                  <label
                    for="search"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--blue)" }}
                  >
                    🔍 Search
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search products or sellers..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilter("searchTerm", e.target.value)}
                      className="outline-none w-full px-4 py-3 rounded-[0.75rem] border-2 transition-all duration-300 focus:scale-101 bee-body-text-desktop"
                      style={{
                        borderColor: "var(--orange)",
                        backgroundColor: "white",
                        color: "var(--blue)",
                      }}
                    />
                    {filters.searchTerm && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 float-animation">
                        🐝
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleSortOrder}
                  className="cursor-pointer flex-1 outline-none w-fit px-3 py-3 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop focus:scale-101"
                  style={{
                    borderColor: "var(--orange)",
                    backgroundColor: "white",
                    color: "var(--blue)",
                  }}
                >
                  {sortOrder === "asc" ? (
                    <>
                      ⬆️{" "}
                      {sortBy === "price"
                        ? "Low-High"
                        : sortBy === "createdAt"
                        ? "Old-New"
                        : "A-Z"}
                    </>
                  ) : (
                    <>
                      ⬇️{" "}
                      {sortBy === "price"
                        ? "High-Low"
                        : sortBy === "createdAt"
                        ? "New-Old"
                        : "Z-A"}
                    </>
                  )}
                </button>
              </div>

              {/* 2. Filter by Category */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--blue)" }}
                >
                  📂 Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilter("category", e.target.value)}
                  className="cursor-pointer outline-none w-full px-4 py-3 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop focus:scale-101"
                  style={{
                    borderColor: "var(--orange)",
                    backgroundColor: "white",
                    color: "var(--blue)",
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Sort By Field */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--blue)" }}
                >
                  📊 Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer outline-none w-full px-4 py-3 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop focus:scale-101"
                  style={{
                    borderColor: "var(--orange)",
                    backgroundColor: "white",
                    color: "var(--blue)",
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Stock State Filter */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--blue)" }}
                >
                  📦 Stock
                </label>
                <select
                  value={filters.inStock === null ? "all" : filters.inStock}
                  onChange={(e) =>
                    setFilter(
                      "inStock",
                      e.target.value === "all"
                        ? null
                        : e.target.value === "true"
                    )
                  }
                  className="cursor-pointer outline-none w-full px-4 py-3 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop focus:scale-101"
                  style={{
                    borderColor: "var(--orange)",
                    backgroundColor: "white",
                    color: "var(--blue)",
                  }}
                >
                  {stockStates.map((state) => (
                    <option
                      key={state.value || null}
                      value={state.value === null ? "all" : state.value}
                    >
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Limited State Filter */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--blue)" }}
                >
                  ⭐ Availability
                </label>
                <select
                  value={filters.isLimited === null ? "all" : filters.isLimited}
                  onChange={(e) =>
                    setFilter(
                      "isLimited",
                      e.target.value === "all"
                        ? null
                        : e.target.value === "true"
                    )
                  }
                  className="cursor-pointer outline-none w-full px-4 py-3 rounded-[0.75rem] border-2 transition-all duration-300 bee-body-text-desktop focus:scale-101"
                  style={{
                    borderColor: "var(--orange)",
                    backgroundColor: "white",
                    color: "var(--blue)",
                  }}
                >
                  {limitedStates.map((state) => (
                    <option
                      key={state.value}
                      value={state.value === null ? "all" : state.value}
                    >
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Info & Reset */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p
                className="bee-body-text-desktop font-semibold"
                style={{ color: "var(--blue)" }}
              >
                🍯 Found {filteredProducts.length} sweet products buzzing with
                flavor!
              </p>

              {/* Active Filters Summary */}
              <div className="flex flex-wrap items-center gap-2">
                {filters.searchTerm && (
                  <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 border border-amber-300">
                    🔍 "{filters.searchTerm}"
                  </span>
                )}
                {filters.category !== "all" && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-300">
                    📂{" "}
                    {
                      categories.find((c) => c.value === filters.category)
                        ?.label
                    }
                  </span>
                )}
                {filters.inStock !== null && (
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-300">
                    📦 {filters.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                )}
                {filters.isLimited !== null && (
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-300">
                    ⭐ {filters.isLimited ? "Limited" : "Regular"}
                  </span>
                )}

                {(filters.searchTerm ||
                  filters.category !== "all" ||
                  filters.inStock !== null ||
                  filters.isLimited !== null) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-full text-sm bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors duration-300"
                  >
                    🔄 Reset All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="w-full px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="max-w-[1440px] mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card-hover">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
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
                Buzz buzz... looks like our bees are still gathering products
                that match your search. Try adjusting your filters to discover
                more sweet treats!
              </p>
              <button
                onClick={resetFilters}
                className="btn-primary px-8 py-4 rounded-[0.75rem] transition-all duration-300 hover:scale-110 bee-body-text-desktop font-semibold"
              >
                🔄 Reset Filters & Explore
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
