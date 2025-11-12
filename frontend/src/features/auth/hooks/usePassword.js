import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
export const useForgotPassword = () => {
    return useMutation({
        mutationFn : async (email) => {
            const {data} = await api.post(`/auth/forgot-password`, {email}, { withCredentials: true }); 
            return data;
        },
        onSuccess: (data) => {
            console.log("Forgot password email sent:", data);
        },

    });

};

export const useResetPassword = () => {
    return useMutation({
        mutationFn : async ({token,password}) => {
            const {data} = await api.post(`/auth/reset-password/${token}`, {password}, { withCredentials: true }); 
            return data;
        }
    });
};