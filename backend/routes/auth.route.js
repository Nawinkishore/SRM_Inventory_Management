import express from 'express';
import { register, login, logout ,verifyEmail, forgotPassword,resetPassword ,checkAuth ,resendVerificationEmail,getProfile,editProfile} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

router.get('/check-auth' , verifyToken ,checkAuth);

// Sample route for user registration
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); // You may want to create a separate controller for resetting password
router.post('/resend-verification', resendVerificationEmail);


// Profile
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, editProfile);

export default router;