import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        console.log("Token from cookies:", token);
        console.log("Access Token:", token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Access Token Provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user=await Seller.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            req.user = user; // Attach user to request object for further use
            console.log("Authenticated user:", req.user.id);
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Unauthorized - Access Token Expired" });
            }
            throw error; // Re-throw other errors to be caught by the outer catch block
        }
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ message: "Unauthorized - Invalid Access Token" });
    }
}