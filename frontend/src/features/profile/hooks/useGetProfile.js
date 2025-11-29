import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setProfile } from "@/store/auth/authSlice";

export const useGetProfile = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get("/auth/profile", {
        withCredentials: true,
      });
      return data;
    },

    onSuccess: (data) => {
      dispatch(setProfile(data.profile));
    }
  });
};