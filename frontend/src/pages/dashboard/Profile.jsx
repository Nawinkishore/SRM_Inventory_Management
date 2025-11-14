import React, { useEffect, useState } from "react";
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  Save,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useGetProfile } from "@/features/profile/hooks/useGetProfile";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { profile1 } = useSelector((state) => state.profile);

  const { mutate: getProfile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load profile initially
  useEffect(() => {
    if (user?._id) getProfile(user._id);
  }, [user]);

  // Sync redux into local editable state
  useEffect(() => {
    if (profile1) setUpdatedProfile(profile1);
  }, [profile1]);

  if (!updatedProfile) return null;

  // -----------------------
  // CLOUDINARY UPLOAD
  // -----------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Cloudinary Response:", data);

      if (data.secure_url) {
        const updated = {
          ...updatedProfile,
          profileImage: data.secure_url,
        };

        // Auto-save immediately
        updateProfile(updated);
        setUpdatedProfile(updated);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  // -----------------------
  // SAVE ENTIRE PROFILE
  // -----------------------
  const handleSave = () => {
    updateProfile(updatedProfile, {
      onSuccess: () => {
        setIsEditing(false);
        getProfile(user._id);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome {updatedProfile.firstName}
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  updatedProfile.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {updatedProfile.status?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">

              {/* --- PROFILE IMAGE SECTION --- */}
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">

                  <img
                    src={
                      updatedProfile.profileImage ||
                      "https://github.com/shadcn.png"
                    }
                    alt="profile"
                    className="w-full h-full object-cover"
                  />

                  {/* Upload Loader */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label
                    htmlFor="profileUpload"
                    className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-2 cursor-pointer text-sm"
                  >
                    Upload
                  </label>

                  <input
                    id="profileUpload"
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {updatedProfile.firstName} {updatedProfile.lastName}
                  </h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mt-2 inline-block">
                    {updatedProfile.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 rounded-xl"
                    >
                      <X size={16} /> Cancel
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                    >
                      <Save size={16} />
                      {isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 flex items-center justify-center gap-2 text-white rounded-xl"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------ SINGLE PAGE FORM ------------------------------ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* PERSONAL INFORMATION */}
          <h3 className="text-xl font-bold mb-6">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* First Name */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                First Name
              </label>
              <input
                disabled={!isEditing}
                value={updatedProfile.firstName}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block mb-2 text-sm font-medium">Last Name</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.lastName}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 text-sm font-medium">Phone</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.phone}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 text-sm font-medium">Gender</label>
              <select
                disabled={!isEditing}
                value={updatedProfile.gender}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                disabled={!isEditing}
                value={
                  updatedProfile.dateOfBirth
                    ? updatedProfile.dateOfBirth.substring(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block mb-2 text-sm font-medium">Role</label>
              <select
                disabled={!isEditing}
                value={updatedProfile.role}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <select
                disabled={!isEditing}
                value={updatedProfile.status}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* ADDRESS INFORMATION */}
          <h3 className="text-xl font-bold mb-6 mt-10">Address Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Street */}
            <div className="md:col-span-2">
              <label className="block mb-2">Street</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.address.street}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              />
            </div>

            {/* City */}
            <div>
              <label className="block mb-2">City</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.address.city}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              />
            </div>

            {/* District */}
            <div>
              <label className="block mb-2">District</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.address.district}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, district: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              />
            </div>

            {/* State */}
            <div>
              <label className="block mb-2">State</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.address.state}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block mb-2">Pincode</label>
              <input
                disabled={!isEditing}
                value={updatedProfile.address.pincode}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, pincode: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              />
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label className="block mb-2">Country</label>
              <select
                disabled={!isEditing}
                value={updatedProfile.address.country}
                onChange={(e) =>
                  setUpdatedProfile((prev) => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 border bg-gray-50 rounded-xl"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
            </div>
          </div>

          {/* SECURITY SECTION */}
          <h3 className="text-xl font-bold mb-6 mt-10">Security</h3>

          <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
            <Clock size={20} />
            <div>
              <p className="font-medium">Last Login</p>
              <p className="text-gray-600">
                {updatedProfile.security?.lastLogin
                  ? new Date(updatedProfile.security.lastLogin).toLocaleString()
                  : "Not Available"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
