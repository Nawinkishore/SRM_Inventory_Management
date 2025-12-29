import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

// CREATE
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/items", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["stockSummary"]);
    }
  });
};


// LIST
export const useItems = ({ page = 1, limit = 10, q = "" }) => {
  return useQuery({
    queryKey: ["items", page, limit, q],
    queryFn: async () => {
      const res = await api.get(`/items?q=${q}&page=${page}&limit=${limit}`);
      return res.data;
    }
  });
};


// GET ONE
export const useItemById = (id) =>
  useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const res = await api.get(`/items/${id}`);
      return res.data;
    },
    enabled: !!id
  });


// UPDATE
export const useUpdateItem = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.put(`/items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["item", id]);
      queryClient.invalidateQueries(["stockSummary"]);
    }
  });
};


// DELETE
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/items/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["stockSummary"]);
    }
  });
};


// SUMMARY
export const useStockSummary = () =>
  useQuery({
    queryKey: ["stockSummary"],
    queryFn: async () => {
      const res = await api.get("/items/summary");
      return res.data;
    }
  });
