import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

export const useAddQuotation = (payload) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/quotation", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};

export const useGetQuotations = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["quotations", page, limit],

    queryFn: async () => {
      const res = await api.get(`/quotation?page=${page}&limit=${limit}`);
      return res.data;
    },

    keepPreviousData: true,
  });
};

export const useGetQuotationById = (id) => {
    return useQuery({
        queryKey: ["quotation", id],
        queryFn: async () => {
            const res = await api.get(`/quotation/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}


export const useUpdateQuotationbyId = () => {
   const queryClient = useQueryClient();
   return useMutation({
    mutationFn:async ({id,payload})=>{
        const response = await api.patch(`/quotation/${id}`,payload);
        return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
    }
   })
}

export const useDeleteQuotationById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/quotation/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}