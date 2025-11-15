import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../../store/auth/authSlice";
export const useDeleteAccount = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.delete('/auth/delete-account', { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            dispatch(clearAuth());
        }
    });
}