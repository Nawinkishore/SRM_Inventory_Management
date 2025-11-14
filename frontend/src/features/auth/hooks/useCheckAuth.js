import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useDispatch } from "react-redux";
import { setAuthData, setLoading, clearAuth } from "../../../store/auth/authSlice";
import { useEffect } from "react";

export const useCheckAuth = () => {
    const dispatch = useDispatch();
    
    const query = useQuery({
        queryKey: ['check-auth'],
        queryFn: async () => {
            const { data } = await api.get(`/auth/check-auth`, { withCredentials: true });
            return data;
        },
        retry: false,
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnMount: true, // Refetch on component mount
    });

    useEffect(() => {
        if (query.isSuccess && query.data) {
            dispatch(setAuthData(query.data));
        } else if (query.isError) {
            dispatch(clearAuth());
        }
        
        if (!query.isLoading) {
            dispatch(setLoading(false));
        }
    }, [query.isSuccess, query.isError, query.isLoading, query.data, dispatch]);

    return query;
}