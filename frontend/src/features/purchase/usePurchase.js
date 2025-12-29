
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData) => {
      const response = await api.post("/purchase/create", purchaseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["purchases"]);
    },
  });
};

export const usePurchaseList = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ["purchases", page, limit],
    queryFn: async () => {
      const response = await api.get(`/purchase/list?page=${page}&limit=${limit}`);
      return {
        purchases: response.data.purchases || [],
        pagination: response.data.pagination || null,
      };
    },
  });
};

export const usePurchaseById = (purchaseId) => {
  return useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: async () => {
      if (!purchaseId) return null;
      const response = await api.get(`/purchase/${purchaseId}`);
      return response.data.purchase || null;
    },
    enabled: !!purchaseId,
  });
};

export const useUpdatePurchase = (purchaseId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData) => {
      const res = await api.put(`/purchase/${purchaseId}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["purchase", purchaseId]);
      queryClient.invalidateQueries(["purchases"]);
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId) => {
      const res = await api.delete(`/purchase/delete/${purchaseId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["purchases"]);
    },
  });
};

export const useNextPurchaseNumber = () => {
  return useQuery({
    queryKey: ["nextPurchaseNumber"],
    queryFn: async () => {
      const response = await api.get("/purchase/nextPurchaseNumber");
      return response.data.nextPurchaseNumber;
    },
  });
};