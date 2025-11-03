import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
export const useRegister = () => {
    return useMutation({
        mutationFn : async (credentials) => {
            const {data} = await api.post(`/auth/register`, credentials, { withCredentials: true });
            return data;
        },
    })
}

export const useVerifyOTP = () => {
    return useMutation({
        mutationFn : async (code) => {
            const {data} = await api.post(`/auth/verify-email`, {code}, { withCredentials: true });
            return data;
        },
    });
};