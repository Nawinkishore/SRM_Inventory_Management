import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setProfile } from "@/store/profile/profileSlice";

export const useUpdateProfile = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (profileData) => {
      // IMPORTANT: send full profile data
      const { data } = await api.put("/auth/profile", profileData, {
        withCredentials: true,
      });

      return data;
    },

    onSuccess: (data) => {
      dispatch(setProfile(data.profile));
    },
  });
};
