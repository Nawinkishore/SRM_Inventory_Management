import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setProfile } from "@/store/auth/authSlice";
import { toast } from "sonner";

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
      toast.success("Profile updated successfully!");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });
};
