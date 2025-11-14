import { useMutation } from "@tanstack/react-query";
import api from "../../../api/axios";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../../store/auth/authSlice";

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout"); // your backend clears cookie
    },
    onSuccess: () => {
      dispatch(clearAuth());
    },
  });
};
