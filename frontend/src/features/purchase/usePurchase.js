import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
export const useCreatePurchase = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData) => {
      const response = await api.post("/purchase/create", purchaseData);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["purchases", userId]);
    },
  });
};


export const usePurchaseList = (userId) => {
  return useQuery({
    queryKey: ["purchases", userId],
    queryFn: async () => {
      if (!userId) return []; // safe fallback
      
      const response = await api.get(`/purchase/list/${userId}`);
      console.log("Purchase list response:", response.data);
      // backend returns: { purchases: [...] }
      return response.data.purchases || [];
    },
    enabled: !!userId, // only run after user exists
  });
};

export const useDeletePurchase = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId) => {
      const res = await api.delete(`/purchase/delete/${purchaseId}`);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["purchases", userId]);
    },
  });
};
