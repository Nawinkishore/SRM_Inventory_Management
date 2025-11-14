import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail
} from '../mailtrap/emails.js';

import { User } from '../models/user.model.js';
import Profile from '../models/profile.model.js';


// -------------------------
// REGISTER
// -------------------------
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        await user.save();

        // ⭐ Auto-create profile
        await Profile.create({
            userId: user._id,
            firstName: name,
            lastName: "",
            role: "admin",
            security: {
                lastLogin: Date.now(),
            }
        });

        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { ...user._doc, password: undefined }
        });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// VERIFY EMAIL
// -------------------------
export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// LOGIN
// -------------------------
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: "User not exists" });

        if (!user.isVerified)
            return res.status(400).json({ success: false, message: "Email not verified" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Invalid Password" });

        generateTokenAndSetCookie(res, user._id);

        // ⭐ Load profile and update login info
        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            {
                $set: { "security.lastLogin": new Date() },
                $push: {
                    "security.loginHistory": {
                        date: new Date(),
                        ip: req.ip,
                        device: req.headers["user-agent"]
                    }
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: { ...user._doc, password: undefined },
            profile
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// LOGOUT
// -------------------------
export const logout = async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};


// -------------------------
// FORGOT PASSWORD
// -------------------------
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: "User does not exist" });

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;
        await user.save();

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );

        return res.status(200).json({ success: true, message: "Password reset email sent" });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// RESET PASSWORD
// -------------------------
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendPasswordResetSuccessEmail(user.email);

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// RESEND VERIFICATION EMAIL
// -------------------------
export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: "User does not exist" });

        if (user.isVerified)
            return res.status(400).json({ success: false, message: "Email is already verified" });

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        return res.status(200).json({ success: true, message: "Verification email resent" });

    } catch (error) {
        console.error("Resend verification email error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};


// -------------------------
// CHECK AUTH (User + Profile)
// -------------------------
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        const profile = await Profile.findOne({ userId: req.userId });

        return res.status(200).json({
            success: true,
            user,
            profile
        });

    } catch (error) {
        console.error("Check auth error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};
// ---------------------------------------------
// GET PROFILE
// ---------------------------------------------
export const getProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json({ success: true, profile });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------
// EDIT PROFILE 
// ---------------------------------------------
export const editProfile = async (req, res) => {
    const userId = req.userId;
    const profileData = req.body;

    try {
        let profile = await Profile.findOne({ userId });

        if (!profile) {
            profile = new Profile({ userId, ...profileData });
        } else {
            Object.assign(profile, profileData);
        }

        await profile.save();

        return res.status(200).json({ success: true, profile });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};