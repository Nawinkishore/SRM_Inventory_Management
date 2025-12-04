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