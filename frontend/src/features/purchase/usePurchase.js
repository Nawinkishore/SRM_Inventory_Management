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
      // backend returns: { purchases: [...] }
      return response.data.purchases || [];
    },
    enabled: !!userId, // only run after user exists
  });
};

export const usePurchaseById = (purchaseId) => {
    return useQuery({
        queryKey: ["purchase", purchaseId],
        queryFn: async () => {
            if (!purchaseId) return null; // safe fallback

            const response = await api.get(`/purchase/${purchaseId}`);
            // backend returns: { purchase: {...} }
            return response.data.purchase || null;
        },
        enabled: !!purchaseId, // only run after purchaseId exists
    });
}

export const useUpdatePurchase = (purchaseId, userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData) => {
      // updateData = { orderName, items }
      const res = await api.put(`/purchase/${purchaseId}`, updateData);
      return res.data;
    },

    onSuccess: () => {
      // refetch single purchase page
      queryClient.invalidateQueries(["purchase", purchaseId]);
      // also refetch purchase list
      queryClient.invalidateQueries(["purchases", userId]);
    },
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
