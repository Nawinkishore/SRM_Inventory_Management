import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

export const useCreatePurchase = () => {
    return useMutation({
        mutationFn: async (purchaseData) => {
            const response = await api.post('/purchase/create', purchaseData);
            return response.data;
        }
    });
}