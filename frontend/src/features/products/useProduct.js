import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export const useProductSearch = (search) => {
  return useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      if (!search) return [];
      const res = await api.get(`/products/getProducts?search=${search}`);
      return res.data.products;
    },
    enabled: !!search,  // only runs when search not empty
  });
};
