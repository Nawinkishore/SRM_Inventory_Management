// features/auth/hooks/useLogout.js
import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
import { useDispatch } from "react-redux";
import { RESET_STORE, persistor } from "@/store/store";

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout"); // backend clears cookie
    },

    onSuccess: async () => {
      // 1. STOP hydration immediately
      await persistor.pause();

      // 2. WIPE whole Redux store (no old state comes back)
      dispatch({ type: RESET_STORE });

      // 3. WIPE persisted storage
      await persistor.purge();

      // 4. Extra safety
      localStorage.clear();
      sessionStorage.clear();

      // 5. HARD redirect (no rehydrate glitch)
      window.location.replace("/login");
    },
  });
};
