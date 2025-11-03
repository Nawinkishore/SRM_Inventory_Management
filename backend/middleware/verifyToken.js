import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            throw new Error('Invalid token');
        }
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error});
    }

}