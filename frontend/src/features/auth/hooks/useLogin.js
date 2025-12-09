import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/auth/login", credentials, {
        withCredentials: true,
      });
      return data;
    },
  });
};
