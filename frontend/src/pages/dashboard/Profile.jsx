import React, { useEffect, useState } from "react";
import { Edit2, Clock, Save, X } from "lucide-react";
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
import { toast } from "sonner";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { profile1 } = useSelector((state) => state.profile);

  const { mutate: getProfile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: deleteAccount } = useDeleteAccount();
  // Change Password States
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

    return ""; // VALID
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

  // Delete logic
  const [isDeleteMatched, setIsDeleteMatched] = useState(false);

  useEffect(() => {
    if (user?._id) getProfile(user._id);
  }, [user]);

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

  // -----------------------
  // DELETE INPUT CHECK
  // -----------------------
  const handleDeleteInput = (e) => {
    const text = e.target.value.trim();
    setIsDeleteMatched(text === `Delete/${updatedProfile.firstName}`);
  };

  // -----------------------
  // DELETE SUBMIT
  // -----------------------
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!isDeleteMatched) return;
    deleteAccount(user._id);
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
              {/* IMAGE */}
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

                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

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

              {/* BUTTONS */}
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

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* PERSONAL INFO */}
          <h3 className="text-xl font-bold mb-6">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FIRST NAME */}
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

            {/* LAST NAME */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Last Name
              </label>
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

            {/* PHONE */}
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

            {/* GENDER */}
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

            {/* DOB */}
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
          </div>

          {/* ADDRESS SECTION */}
          <h3 className="text-xl font-bold mb-6 mt-10">Address Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STREET */}
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

            {/* CITY */}
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

            {/* DISTRICT */}
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

            {/* STATE */}
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

            {/* PINCODE */}
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

            {/* COUNTRY */}
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
          <h3 className="text-xl font-bold mb-6 mt-10">Account Settings</h3>

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

          {/* DELETE ACCOUNT */}
          <div className="mt-6 flex items-center justify-between">
            <Dialog>
              <form onSubmit={handleDeleteSubmit}>
                <DialogTrigger asChild>
                  <Button variant="outline">Delete Account</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" aria-describedby="delete-account-description">
                  <DialogHeader>
                    <DialogTitle>Delete profile</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label className="text-red-500">
                        Type "Delete/{updatedProfile.firstName}" to confirm
                      </Label>
                      <Input
                        placeholder="Type here"
                        onChange={handleDeleteInput}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600"
                      disabled={!isDeleteMatched}
                      onClick={handleDeleteSubmit}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
            <Dialog>
              <form onSubmit={handlePasswordSubmit}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]" aria-describedby="change-password-description">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4">
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}

                    {/* Current Password */}
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

                    {/* New Password */}
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

                    {/* Confirm Password */}
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

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isChanging}
                      onClick={handlePasswordSubmit}
                    >
                      {isChanging ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          
          
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
