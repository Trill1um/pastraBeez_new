import { create } from 'zustand';
import { 
  useAllProducts, 
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../lib/query';

// ============ ZUSTAND STORE (Processing Logic) ============
export const useProductProcessor = create((set, get) => ({
  // UI State
  sort: {
    by: 'name', // Default sort by name
    order: 'asc' // Default ascending order
  },
  filters: {
    category: null,
    inStock: null,
    searchTerm: '',
    isLimited: null,
  },

  // Sort Labels and Types
  labels: {
    price: {
      direction: {
        asc: "⬆️ Low-High",
        desc: "⬇️ High-Low"
      },
      type: "number"
    },
    name: {
      direction: {
        asc: "⬆️ A-Z",
        desc: "⬇️ Z-A"
      },
      type: "string"
    },
    createdAt: {
      direction: {
        asc: "⬆️ Old-New",
        desc: "⬇️ New-Old"
      },
      type: "date"
    },
  },

  // ============ CORE PROCESSING FUNCTIONS ============
  processProducts: (rawProducts) => {
    const { filters } = get();
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
    const { sort, labels } = get();
    
    if (!products || !Array.isArray(products)) return [];
    
    // Find sort option configuration (array)
    return [...products].sort((a, b) => {
      let aValue = a?.[sort.by];
      let bValue = b?.[sort.by];
      
      // Handle nullish values first
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      let comparison = 0;
      
      switch (labels[sort.by].type) {
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
      
      return sort.order === 'asc' ? comparison : -comparison;
    });
  },

  // ============ ENHANCED ACTIONS ============

  setSortBy: (sortBy) => set((state) => ({
    sort: { ...state.sort, by: sortBy }
  })),
  
  setSortOrder: (sortOrder) => set((state) => ({
    sort: { ...state.sort, order: sortOrder }
  })),

  // Toggle sort order for current sort.by
  toggleSortOrder: () => set((state) => ({
    sort: { ...state.sort, order: state.sort.order === 'asc' ? 'desc' : 'asc' }
  })),
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  resetFilters: () => set({
    filters: {
      category: null,
      inStock: null,
      searchTerm: '',
      isLimited: null,
    }
  }),
  
  resetSort: () => set({
    sort: {
      by: 'name', 
      order: 'asc'
    }
  }),

}));

// ============ COMBINED HOOKS (Magic Layer) ============

// Hook for all products with processing and mutations
export function useProcessedProducts() {
  const query = useAllProducts();
  const processor = useProductProcessor();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  
  const rawProducts = query.data?.products || query.data || [];
  const processedProducts = processor.processProducts(rawProducts);
  
  return {
    // Data
    products: processedProducts,
    rawProducts,

    // Query states
    isLoading: query.isLoading,
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
    
    // All processor actions and state
    ...processor
  };
}

// Helper hook to get a specific product by ID from all products
export function useProductById(productId) {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  if (!productId) return {product:null};
  const product = rawProducts.find(p => p._id === productId);
  
  return {
    product,
    isLoading,
    error,
  };
}

// Hook for seller-specific products (filters from all products)
export function useSellerProducts(sellerId) {
  const { rawProducts, isLoading, error } = useProcessedProducts();
  
  // Filter products by seller
  const sellerProducts = rawProducts.filter(p => 
    p.sellerId._id === sellerId
  );
  
  return {
    sellerProducts,
    isLoading,
    error,
  };
}