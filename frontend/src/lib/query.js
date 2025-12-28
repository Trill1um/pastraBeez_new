import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import toast from "react-hot-toast";

// ============ QUERY KEYS ============
export const productQueryKeys = {
  all: ["products"],
};

// ============ API FUNCTIONS ============
const fetchAllProducts = async () => {
  const response = await axios.get("/products");
  // console.log("All products fetched:", response.data);
  return response.data;
};

const createProduct = async (productData) => {
  const now = Date.now();
  const response = await axios.post("/products/create-my-product", productData);
  // console.log("Product created:", response.data);
  response.time=Date.now()-now;
  toast.success(response.data.message);
  toast.success(response.time);
  console.log(response);
  return response.data;
};

const updateProduct = async ({ productId, productData }) => {
  // console.log("Updating product with ID:", productId, "Data:", productData);
  const response = await axios.put(`/products/${productId}`, productData);
  // console.log("Product updated:", response.data);
  return response.data;
};

const deleteProduct = async (productId) => {
  // console.log("Deleting product with ID:", productId);
  const response = await axios.delete(`/products/${productId}`);
  // console.log("Product deleted:", productId);
  return response.data;
};

const rateProduct = async ({ productId, rating }) => {
  const response = await axios.put(`/products/rate/${productId}`, { rating });
  // console.log("Product rated:", response.data);
  return response.data;
};

const unRateProduct = async ({ productId }) => {
  const response = await axios.delete(`/products/rate:${productId}`);
  // console.log("Product removed rating:", response.data);
  return response.data;
};

// ============ QUERY HOOKS ============
export function useAllProducts() {
  return useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchAllProducts,
    staleTime: Infinity,
    onError: (error) => {
      console.error("Error fetching all products:", error);
      toast.error("Failed to fetch products");
    },
  });
}

// ============ MUTATION HOOKS ============
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all products cache
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      // Invalidate all products cache to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });

      toast.success("Product updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // Invalidate all products cache to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });

      toast.success("Product deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
}

export function useRateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Error rating product:", error);
      toast.error(error.response?.data?.message || "Failed to rate product");
    },
  });
}

export function useUnRateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unRateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error("Error removing rating of a  product:", error);
      toast.error(error.response?.data?.message || "Failed to rate product");
    },
  });
}

// ============ UTILITY FUNCTIONS ============
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
    refetchAll: () => {
      queryClient.refetchQueries({ queryKey: productQueryKeys.all });
    },
  };
}
