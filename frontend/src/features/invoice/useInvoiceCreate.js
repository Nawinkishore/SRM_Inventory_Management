import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

export const useInvoiceCreate = () => {
    return useMutation({
        mutationFn: async (invoiceData) => {
            const response = await api.post("/invoices/create", invoiceData, {
                withCredentials: true,
            });
            return response.data;
        },
        onError: (error) => {
            console.error("Invoice creation error:", error.response?.data || error.message);
        },
    });
};