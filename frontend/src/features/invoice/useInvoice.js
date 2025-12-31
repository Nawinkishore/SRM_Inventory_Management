import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export const useNextInvoiceNumber = () => {
  return useQuery({
    queryKey: ["next-invoice-number"],
    queryFn: async () => {
      const response = await api.get("/invoice/next-number");
      return response.data.invoiceNumber;
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData) => {
      return api.post("/invoice/", invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      queryClient.invalidateQueries(["next-invoice-number"]);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return api.put(`/invoice/${id}`, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["invoice", variables.id]);
      queryClient.invalidateQueries(["invoices"]);
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/invoice/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
    },
  });
};


export const useInvoices = ({ page, limit, type, status, search, customerName }) => {
  return useQuery({
    queryKey: ["invoices", page, limit, type, status, search, customerName],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (type && type !== "all") params.append("invoiceType", type);
      if (status && status !== "all") params.append("invoiceStatus", status);
      if (search) params.append("q", search);
      if (customerName) params.append("customerName", customerName);

      const res = await api.get(`/invoice?${params.toString()}`);
      return res.data;
    },
  });
};
  
export const useInvoiceById = (id) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await api.get(`/invoice/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};
