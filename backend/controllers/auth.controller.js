import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail ,sendWelcomeEmail ,sendPasswordResetEmail, sendPasswordResetSuccessEmail} from '../mailtrap/emails.js';
import {User} from '../models/user.model.js';

export const register = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({success:false, message:"All fields are required"});
        }
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({success:false, message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({
            name, 
            email, 
            password:hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 1 day
        });
        await user.save();
        generateTokenAndSetCookie(res,user._id);
        await sendVerificationEmail(user.email, verificationToken);
        return res.status(201).json({success:true, message:"User registered successfully",user:{
            ...user._doc, password:undefined
        }});
    }
    catch(error)
    {
        return res.status(400).json({success:false, message:error.message});
    }
};
export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({verificationToken: code,verificationTokenExpiresAt: {$gt: Date.now()}});
        if (!user) {
            return res.status(400).json({success:false, message:"Invalid or expired verification code"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        res.status(200).json({success:true, message:"Email verified successfully", user:{
            ...user._doc, password:undefined
        }});
    } catch (error) {
        return res.status(400).json({success:false, message:error.message});
    }
};
export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:"User not exists"});
        }
        const isVerified = user.isVerified;
        if (!isVerified) {
            return res.status(400).json({ success: false, message: "Email not verified" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success:false, message:"Invalid Password"});
        }
        generateTokenAndSetCookie(res,user._id);
        return res.status(200).json({success:true, message:"Logged in successfully", user:{
            ...user._doc, password:undefined
        }});
    }
    catch(error)
    {
        console.error("Login error:", error);
        return res.status(400).json({success:false, message:error.message});
    }
};

export const logout = async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({success:true, message:"Logged out successfully"});
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();
        await sendPasswordResetEmail(user.email,  `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        return res.status(200).json({ success: true, message: "Password reset email sent" });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    try {
        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpiresAt: {$gt: Date.now()}});
        if (!user) {
            return res.status(400).json({success:false, message:"Invalid or expired reset token"});
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendPasswordResetSuccessEmail(user.email);
        res.status(200).json({success:true, message:"Password reset successfully"});
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(400).json({success:false, message:error.message});
    }
}


export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true,user });
    } catch (error) {
        console.error("Check auth error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
}