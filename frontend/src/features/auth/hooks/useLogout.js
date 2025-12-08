// features/auth/hooks/useLogout.js
import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
import { useDispatch } from "react-redux";

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout"); // backend clears cookie
    },

    onSuccess: () => {
      window.location.replace("/login");
    },
  });
};
