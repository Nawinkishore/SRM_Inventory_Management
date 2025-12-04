import React, { useEffect, useState } from "react";
import { Edit2, Clock, Save, X, Upload, User, Mail, Phone, MapPin, Shield } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { useGetProfile } from "@/features/profile/hooks/useGetProfile";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import { useDeleteAccount } from "@/features/auth/hooks/useDeleteAccount";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";

const Profile = () => {
  // Updated to use merged auth slice
  const { user, profile } = useSelector((state) => state.auth);

  const { mutate: getProfile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: deleteAccount } = useDeleteAccount();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState("");

  const { mutate: changePassword, isPending: isChanging } = useChangePassword();
  
  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword.trim()) return "Current password is required.";

    if (newPassword.length < 8)
      return "New password must be at least 8 characters.";

    if (newPassword === currentPassword)
      return "New password cannot be the same as current password.";

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongRegex.test(newPassword))
      return "Password must include uppercase, lowercase, number, and special character.";

    if (newPassword !== confirmPassword)
      return "Confirm password does not match.";

    return "";
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const err = validatePassword();
    setPasswordError(err);

    if (err) return;

    changePassword(
      {
        userId: user._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordError("");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDeleteMatched, setIsDeleteMatched] = useState(false);

  useEffect(() => {
    if (user?._id) getProfile(user._id);
  }, [user]);

  useEffect(() => {
    if (profile) setUpdatedProfile(profile);
  }, [profile]);

  if (!updatedProfile) return null;

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

      if (data.secure_url) {
        const updated = {
          ...updatedProfile,
          profileImage: data.secure_url,
        };

        updateProfile(updated);
        setUpdatedProfile(updated);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateProfile(updatedProfile, {
      onSuccess: () => {
        setIsEditing(false);
        getProfile(user._id);
      },
    });
  };

  const handleDeleteInput = (e) => {
    const text = e.target.value.trim();
    setIsDeleteMatched(text === `Delete/${updatedProfile.firstName}`);
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!isDeleteMatched) return;
    deleteAccount(user._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {updatedProfile.firstName}!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your profile and account settings
          </p>
        </div>

        {/* Profile Card with Cover */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-6 right-6 flex gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
                  updatedProfile.status === "active"
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                }`}
              >
                {updatedProfile.status?.toUpperCase()}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/90 text-blue-700 shadow-lg backdrop-blur-sm">
                {updatedProfile.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="px-8 pb-8 mt-10">
            {/* Profile Image & Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-36 h-36 rounded-3xl border-6 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={
                        updatedProfile.profileImage ||
                        "https://github.com/shadcn.png"
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />

                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}

                    <label
                      htmlFor="profileUpload"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white"
                    >
                      <Upload size={24} className="mb-1" />
                      <span className="text-sm font-medium">Change Photo</span>
                    </label>
                    <input
                      id="profileUpload"
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Name & Email */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {updatedProfile.firstName} {updatedProfile.lastName}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start">
                    <Mail size={16} />
                    {user?.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2 mt-1 justify-center md:justify-start">
                    <Phone size={16} />
                    {updatedProfile.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 md:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-colors flex items-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-medium transition-all shadow-lg flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.firstName}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.lastName}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.phone}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Gender</label>
                <select
                  disabled={!isEditing}
                  value={updatedProfile.gender}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="flex items-center gap-3 mt-10 mb-6">
              <div className="p-3 bg-green-100 rounded-2xl">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Address Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Street Address</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.address.street}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">City</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.address.city}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">District</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.address.district}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, district: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">State</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.address.state}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Pincode</label>
                <input
                  disabled={!isEditing}
                  value={updatedProfile.address.pincode}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, pincode: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Country</label>
                <select
                  disabled={!isEditing}
                  value={updatedProfile.address.country}
                  onChange={(e) =>
                    setUpdatedProfile((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security & Settings Sidebar */}
          <div className="space-y-6">
            {/* Account Security */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Security</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl mb-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Last Login</p>
                    <p className="text-sm text-gray-600">
                      {updatedProfile.security?.lastLogin
                        ? new Date(updatedProfile.security.lastLogin).toLocaleString()
                        : "Not Available"}
                    </p>
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-medium transition-all shadow-lg">
                    Change Password
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]" aria-describedby="change-password-description">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="grid gap-4">
                      {passwordError && (
                        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{passwordError}</p>
                      )}

                      <div className="grid gap-2">
                        <Label>Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({
                                ...p,
                                currentPassword: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() =>
                              setShowPassword((p) => ({
                                ...p,
                                current: !p.current,
                              }))
                            }
                          >
                            {showPassword.current ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>New Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({
                                ...p,
                                newPassword: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() =>
                              setShowPassword((p) => ({ ...p, new: !p.new }))
                            }
                          >
                            {showPassword.new ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Confirm Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({
                                ...p,
                                confirmPassword: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() =>
                              setShowPassword((p) => ({
                                ...p,
                                confirm: !p.confirm,
                              }))
                            }
                          >
                            {showPassword.confirm ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>

                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isChanging}
                      >
                        {isChanging ? "Changing..." : "Change Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-red-200">
              <h3 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-all shadow-lg">
                    Delete Account
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]" aria-describedby="delete-account-description">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleDeleteSubmit}>
                    <div className="grid gap-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                          This action cannot be undone. This will permanently delete your account and remove all your data.
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <Label className="text-red-600 font-semibold">
                          Type "Delete/{updatedProfile.firstName}" to confirm
                        </Label>
                        <Input
                          placeholder="Type here"
                          onChange={handleDeleteInput}
                          className="border-red-300 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>

                      <Button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={!isDeleteMatched}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;