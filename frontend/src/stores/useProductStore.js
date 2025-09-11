import { create } from 'zustand';
import { 
  useAllProducts, 
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useInvalidateProducts
} from '../lib/query';


// ============ ZUSTAND STORE (Processing Logic) ============
export const useProductProcessor = create((set, get) => ({
  // UI State
  isFilterShow: null,
  sortBy: 'name',
  sortOrder: 'asc',
  filters: {
    category: null,
    inStock: null,
    searchTerm: '',
    isLimited: null,
  },
  
  // Preview/Display options
  viewMode: 'grid', // 'grid', 'list', 'table'

  // Sort configuration with predefined options
  sortOptions: [
    { value: 'name', label: 'Product Name', type: 'string' },
    { value: 'sellerName', label: 'Seller Name', type: 'string' },
    { value: 'colonyName', label: 'Colony Name', type: 'string' },
    { value: 'price', label: 'Price', type: 'number' },
    { value: 'category', label: 'Category', type: 'string' },
    { value: 'createdAt', label: 'Date Added', type: 'date' },
    { value: 'updatedAt', label: 'Last Updated', type: 'date' },
    { value: 'stock', label: 'Stock Level', type: 'number' },
  ],

  // ============ CORE PROCESSING FUNCTIONS ============
  processProducts: (rawProducts) => {
    const { sortBy, sortOrder, filters } = get();
    
    if (!rawProducts || !Array.isArray(rawProducts)) return [];
    
    // Apply filters
    let filtered = rawProducts.filter(product => {
      // Category filter
      if (filters.category !== null && product.category !== filters.category) return false;
      
      // Stock filter
      if (filters.inStock !== null && product.inStock !== filters.inStock) return false;
      
      // isLimited filter
      if (filters.isLimited !== null && product.isLimited !== filters.isLimited) return false;
      
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.sellerId.colonyName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
    
    // Apply sorting
    return get().sortProducts(filtered);
  },

  // Enhanced sorting function
  sortProducts: (products) => {
    const { sortBy, sortOrder, sortOptions } = get();
    
    if (!products || !Array.isArray(products)) return [];
    
    // Find sort option configuration
    const sortConfig = sortOptions.find(option => option.value === sortBy);
    const sortType = sortConfig?.type || 'string';
    
    return [...products].sort((a, b) => {
      let aValue = get().getSortValue(a, sortBy);
      let bValue = get().getSortValue(b, sortBy);
      
      // Handle nullish values first
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      let comparison = 0;
      
      switch (sortType) {
        case 'string':
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          comparison = aValue.localeCompare(bValue);
          break;
          
        case 'number':
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          comparison = aValue - bValue;
          break;
          
        case 'date':
          aValue = new Date(aValue);
          bValue = new Date(bValue);
          comparison = aValue.getTime() - bValue.getTime();
          break;
          
        default:
          comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  },

  // Helper to get sort value with fallbacks for nested properties
  getSortValue: (product, sortBy) => {
    switch (sortBy) {
      case 'sellerName':
        return product.sellerId._id?.colonyName || product.sellerId._id || product.colonyName || '';
      case 'colonyName':
        return product.sellerId._id?.colonyName || product.colonyName || '';
      case 'price':
        return product.price || product.currentPrice || 0;
      case 'stock':
        return product.stock || product.quantity || 0;
      default:
        return product[sortBy];
    }
  },

  // ============ ENHANCED ACTIONS ============
  setFilterShow: (isShow) => set({ isFilterShow: isShow }),
  toggleFilterShow: (id) =>set((state) => ({
      isFilterShow: state.isFilterShow === id ? null : id,
  })),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  
  // Quick sort actions for common use cases
  sortByPriceAsc: () => set({ sortBy: 'price', sortOrder: 'asc' }),
  sortByPriceDesc: () => set({ sortBy: 'price', sortOrder: 'desc' }),
  sortByNameAsc: () => set({ sortBy: 'name', sortOrder: 'asc' }),
  sortByNameDesc: () => set({ sortBy: 'name', sortOrder: 'desc' }),
  sortBySellerAsc: () => set({ sortBy: 'sellerName', sortOrder: 'asc' }),
  sortBySellerDesc: () => set({ sortBy: 'sellerName', sortOrder: 'desc' }),
  sortByDateNewest: () => set({ sortBy: 'createdAt', sortOrder: 'desc' }),
  sortByDateOldest: () => set({ sortBy: 'createdAt', sortOrder: 'asc' }),
  
  // Toggle sort order for current sortBy
  toggleSortOrder: () => set((state) => ({
    sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
  })),
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  resetFilters: () => set({
    filters: {
      category: 'all',
      inStock: null,
      searchTerm: '',
      isLimited: null,
    }
  }),
  
  resetSort: () => set({
    sortBy: 'name',
    sortOrder: 'asc'
  }),

  // View/Display actions
  setViewMode: (viewMode) => set({ viewMode }),

  // ============ UTILITY FUNCTIONS ============
  getUniqueCategories: (rawProducts) => {
    if (!rawProducts) return [];
    return [...new Set(rawProducts.map(p => p.category).filter(Boolean))];
  },

  getUniqueSellers: (rawProducts) => {
    if (!rawProducts) return [];
    const sellers = rawProducts.map(p => 
      p.sellerId._id?.colonyName || p.sellerId._id || p.colonyName
    ).filter(Boolean);
    return [...new Set(sellers)];
  },

  getPriceRange: (rawProducts) => {
    if (!rawProducts) return { min: 0, max: 0 };
    const prices = rawProducts
      .map(p => parseFloat(p.price || p.currentPrice || 0))
      .filter(price => price > 0);
    
    return {
      min: Math.min(...prices) || 0,
      max: Math.max(...prices) || 0
    };
  },

  searchProducts: (products, searchTerm) => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.sellerId._id?.toLowerCase().includes(term) ||
      product.colonyName?.toLowerCase().includes(term)
    );
  },

  // Get current sort configuration
  getCurrentSortConfig: () => {
    const { sortBy, sortOrder, sortOptions } = get();
    const config = sortOptions.find(option => option.value === sortBy);
    return {
      ...config,
      sortOrder,
      label: `${config?.label || sortBy} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
    };
  },

  // Get formatted sort label
  getSortLabel: (sortBy, sortOrder) => {
    const { sortOptions } = get();
    const config = sortOptions.find(option => option.value === sortBy);
    const baseLabel = config?.label || sortBy;
    
    switch (config?.type) {
      case 'number':
        return `${baseLabel} (${sortOrder === 'asc' ? 'Low to High' : 'High to Low'})`;
      case 'date':
        return `${baseLabel} (${sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})`;
      default:
        return `${baseLabel} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;
    }
  }
}));

// ============ COMBINED HOOKS (Magic Layer) ============

// Hook for all products with processing and mutations
export function useProcessedProducts() {
  const query = useAllProducts();
  const processor = useProductProcessor();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const invalidateQueries = useInvalidateProducts();
  
  const rawProducts = query.data?.products || query.data || [];
  const processedProducts = processor.processProducts(rawProducts);
  
  return {
    // Data
    products: processedProducts,
    rawProducts,
    
    // Query states
    isLoadingD: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Mutations
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Async mutation functions (for await usage)
    createProductAsync: createMutation.mutateAsync,
    updateProductAsync: updateMutation.mutateAsync,
    deleteProductAsync: deleteMutation.mutateAsync,
    
    // Invalidation utilities
    ...invalidateQueries,
    
    // All processor actions and state
    ...processor
  };
}

// Helper hook to get a specific product by ID from all products
export function useProductById(productId) {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  
  const product = rawProducts.find(p => p.id === productId || p._id === productId);
  
  return {
    product,
    isLoading,
    error,
    isFound: !!product
  };
}

// Hook for seller-specific products (filters from all products)
export function useSellerProducts(sellerId) {
  const { rawProducts, isLoading, error, ...rest } = useProcessedProducts();
  
  // Filter products by seller
  console.log("raw Products:", rawProducts);
  console.log("user", sellerId)
  const sellerRawProducts = rawProducts.filter(p => 
    p.sellerId._id === sellerId || p.sellerId === sellerId
  );
  
  return {
    sellerProducts: sellerRawProducts,
    isLoading,
    error,
    ...rest
  };
}

// ============ UTILITY HOOKS ============

// Hook for product creation (can be used anywhere)
export function useProductCreator() {
  const createMutation = useCreateProduct();
  const invalidateQueries = useInvalidateProducts();
  
  return {
    createProduct: createMutation.mutate,
    createProductAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    
    // Invalidation utilities
    ...invalidateQueries,
  };
}

// Hook for bulk operations (useful for admin interfaces)
export function useProductBulkOperations() {
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const invalidateQueries = useInvalidateProducts();
  
  const bulkUpdate = async (updates) => {
    const promises = updates.map(({ productId, productData }) =>
      updateMutation.mutateAsync({ productId, productData })
    );
    return Promise.all(promises);
  };
  
  const bulkDelete = async (productIds) => {
    const promises = productIds.map(productId =>
      deleteMutation.mutateAsync(productId)
    );
    return Promise.all(promises);
  };

  const updateSingle = async (productId, productData) => {
    return updateMutation.mutateAsync({ productId, productData });
  };
  
  return {
    bulkUpdate,
    bulkDelete,
    updateSingle,
    isProcessing: updateMutation.isPending || deleteMutation.isPending,
    
    // Invalidation utilities
    ...invalidateQueries,
  };
}