import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";
import { useDispatch } from "react-redux";  
import { setUser } from "../../../store/auth/authSlice";

export const useLogin = () => {;
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: async(credentials) =>{
            const {data} = await api.post(`/auth/login`, credentials, { withCredentials: true });
            return data;
        },
        onSuccess: (data) => {
            dispatch(setUser({user: data.user}));
            
        },
    })
}