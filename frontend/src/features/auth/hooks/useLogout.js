// features/auth/hooks/useLogout.js
import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../../store/auth/authSlice";
import { RESET_STORE, persistor } from "@/store/store";

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout"); // backend clears cookie
    },

    onSuccess: async () => {
      // clear auth slice data
      dispatch(clearAuth());

      // wipe entire redux store
      dispatch({ type: RESET_STORE });

      // clear persisted storage
      await persistor.purge();

      // safety
      localStorage.clear();
      sessionStorage.clear();

      // redirect
      window.location.href = "/login";
    },
  });
};
