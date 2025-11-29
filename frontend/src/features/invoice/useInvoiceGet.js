// src/features/invoice/useInvoiceGet.js
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export const fetchInvoicesApi = async (search) => {
  const { data } = await api.get('/invoices/getInvoices', {
    params: { search: search || '' },
    withCredentials: true,
  });
  return data;
};

export const useInvoices = (search) => {
  return useQuery({
    queryKey: ['invoices', search ?? ''],
    // queryFn receives a context with queryKey; use it to get latest search
    queryFn: ({ queryKey }) => {
      const [_key, q] = queryKey;
      return fetchInvoicesApi(q);
    },
    staleTime: 1000 * 60, // 1 minute
    keepPreviousData: true,
    // optional: refetchOnWindowFocus: false,
  });
};
