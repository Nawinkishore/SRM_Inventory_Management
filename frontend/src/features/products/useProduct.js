import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

export const useProductSearch = (search) => {
  return useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      if (!search) return [];
      const res = await api.get(`/products/getProducts?search=${search}`);
      return res.data.products;
    },
    enabled: !!search,
  });
};

export const useInfiniteProducts = (limit = 30, search = "") => {
  return useInfiniteQuery({
    queryKey: ["infiniteProducts", search],
    
    queryFn: async ({ pageParam = null }) => {
      const res = await api.get("/products/infinite", {
        params: {
          limit,
          lastId: pageParam || null,
          search: search || ""
        }
      });
      return res.data;
    },
    
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore || !lastPage?.lastId) {
        return undefined;
      }
      return lastPage.lastId;
    },
    
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProductById = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.item;
    },
    enabled: !!id,
  });
};

export const useUpdateProduct = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.patch(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["infiniteProducts"]);
      queryClient.invalidateQueries(["product", id]);
      queryClient.invalidateQueries(["productStats"]);
    }
  });
};

export const useProductStats = () => {
  return useQuery({
    queryKey: ["productStats"],
    queryFn: async () => {
      const res = await api.get("/products/stats");
      return res.data.statistics;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/products/create", data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all product-related queries to refresh the data
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["infiniteProducts"]);
      queryClient.invalidateQueries(["productStats"]);
    },
    onError: (error) => {
      console.error("Create product error:", error);
    }
  });
};

export const useDeleteProduct = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);  
    }});
}