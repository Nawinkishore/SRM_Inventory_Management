import { useMutation,useQueryClient,useQuery } from "@tanstack/react-query";
import api from '@/api/axios'
export const useNextInvoiceNumber = () =>{
    return useQuery({
        queryKey :['next-invoice-number'],
        queryFn : async ()=>{
            const response = await api.get('/invoice/next-number');
            return response.data.invoiceNumber;
        }
    })
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData) => {
      return api.post("/invoice/", invoiceData);
    },
    onSuccess: () => {
      // refresh invoices list
      queryClient.invalidateQueries(["invoices"]);

      // refresh next number if needed
      queryClient.invalidateQueries(["next-invoice-number"]);
    }
  });
};

export const useInvoices = ({ page, limit, type, search, customerName }) => {
  return useQuery({
    queryKey: ["invoices", page, limit, type, search, customerName],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (type && type !== "all") params.append("invoiceType", type);
      if (search) params.append("q", search);
      if (customerName) params.append("customerName", customerName);

      const res = await api.get(`/invoice?${params.toString()}`);
      return res.data;
    },
  });
};
