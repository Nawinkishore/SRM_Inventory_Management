import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { setInvoices,deleteInvoice } from "@/store/invoices/invoiceSlice";
import { useDispatch } from "react-redux";
import {toast} from "sonner";
export const useGetInvoices = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (UserId) => {
      const { data } = await api.post(
        "/invoice/getInvoices",
        { UserId },
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      
        dispatch(setInvoices(data.invoices));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to fetch invoices");
    }
  });
};

export const useSearchInvoices = () => {
  return useMutation({
    mutationFn: async ({ UserId, query }) => {
      const { data } = await api.post(
        "/invoice/search",
        { UserId, query },
        {
          withCredentials: true,
        }
      );
      return data;
    }
  });
}

export const useDeleteInvoice = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (invoiceId) => {
      const { data } = await api.delete(`/invoice/delete/${invoiceId}`, {
        withCredentials: true,
      });
      return data;
    },
    onSuccess: (data) => {
      dispatch(deleteInvoice(data.invoiceId));  
      // toast.success("Invoice deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  });
};
