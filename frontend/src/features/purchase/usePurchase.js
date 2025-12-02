import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export const useCreatePurchase = () => {
    return useMutation({
        mutationFn: async (purchaseData) => {
            const response = await api.post('/purchase/create', purchaseData);
            return response.data;
        }
    });
}


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