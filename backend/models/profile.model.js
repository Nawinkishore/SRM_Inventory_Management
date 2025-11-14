import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // Basic Profile Info
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },

    profileImage: { type: String, default: "" },  // Cloudinary URL

    gender: { 
      type: String, 
      enum: ["male", "female", "other", ""], 
      default: ""
    },

    dateOfBirth: { type: Date },

    // Address Section
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    // User Role (Admin panel level)
    role: {
      type: String,
      enum: ["admin", "manager", "staff", "viewer"],
      default: "admin"
    },

    // UI Settings
    // Extra security (User login tracking)
    security: {
      lastLogin: { type: Date, default: Date.now },
      loginHistory: [
        {
          date: { type: Date, default: Date.now },
          ip: String,
          device: String,
        },
      ],
    },

    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", ProfileSchema);
