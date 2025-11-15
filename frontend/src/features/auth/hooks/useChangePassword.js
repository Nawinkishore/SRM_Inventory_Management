import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }) => {
      return api.post("/auth/change-password", {
        userId,
        currentPassword,
        newPassword,
      });
    },
  });
};
