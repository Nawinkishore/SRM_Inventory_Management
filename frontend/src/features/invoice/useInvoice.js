import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { setInvoices } from "@/store/invoices/invoiceSlice";
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
