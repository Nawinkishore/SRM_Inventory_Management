import api from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  setInvoices,
  addInvoice,
  updateInvoice as updateInvoiceAction,
  deleteInvoice as deleteInvoiceAction,
  setLoading,
  setError,
} from "@/store/invoices/invoiceSlice";

// Get all invoices or search
export const useGetInvoices = (searchQuery = "") => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["invoices", searchQuery],
    queryFn: async () => {
      dispatch(setLoading(true));
      const endpoint = searchQuery
        ? `/invoice/getInvoices?search=${encodeURIComponent(searchQuery)}`
        : "/invoice/getInvoices";
      
      const { data } = await api.get(endpoint, {
        withCredentials: true,
      });
      
      dispatch(setInvoices(Array.isArray(data) ? data : []));
      dispatch(setLoading(false));
      return data;
    },
    onError: (error) => {
      dispatch(setLoading(false));
      const errorMessage = error.response?.data?.error || "Failed to fetch invoices";
      dispatch(setError(errorMessage));
      console.error("Invoice fetch error:", errorMessage);
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

// Create new invoice
export const useCreateInvoice = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData) => {
      const { data } = await api.post("/invoice/create", invoiceData, {
        withCredentials: true,
      });
      return data;
    },
    onSuccess: (data) => {
      dispatch(addInvoice(data));
      queryClient.invalidateQueries(["invoices"]);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "Failed to create invoice";
      dispatch(setError(errorMessage));
    },
  });
};

// Update invoice
export const useUpdateInvoice = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, invoiceData }) => {
      const { data } = await api.put(`/invoice/${invoiceId}`, invoiceData, {
        withCredentials: true,
      });
      return data;
    },
    onSuccess: (data) => {
      dispatch(updateInvoiceAction(data));
      queryClient.invalidateQueries(["invoices"]);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "Failed to update invoice";
      dispatch(setError(errorMessage));
    },
  });
};

// Delete invoice
export const useDeleteInvoice = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId) => {
      const { data } = await api.delete(`/invoice/${invoiceId}`, {
        withCredentials: true,
      });
      return { ...data, id: invoiceId };
    },
    onSuccess: (data) => {
      dispatch(deleteInvoiceAction(data.id));
      queryClient.invalidateQueries(["invoices"]);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "Failed to delete invoice";
      dispatch(setError(errorMessage));
    },
  });
};