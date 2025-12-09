import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

// ------------------------------
// REGISTER
// ------------------------------
export const useRegister = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post(`/auth/register`, credentials, {
        withCredentials: true,
      });
      return data;
    },
  });
};

// ------------------------------
// VERIFY OTP
// ------------------------------
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (code) => {
      const { data } = await api.post(
        `/auth/verify-email`,
        { code },
        { withCredentials: true }
      );
      return data;
    },
  });
};

// ------------------------------
// RESEND VERIFICATION EMAIL
// ------------------------------
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (email) => {
      const { data } = await api.post(
        `/auth/resend-verification`,
        { email },
        { withCredentials: true }
      );
      return data;
    },
  });
};
