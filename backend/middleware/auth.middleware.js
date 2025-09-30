import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Access Token Provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // Attach user to request object for further use
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access Token Expired" });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(401).json({ message: "Unauthorized - Invalid Access Token" });
  }
};

export const sellerRoute = async (req, res, next) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Forbidden - Sellers Only" });
    }
    next();
  } catch(error) {
    console.error("Error in sellerRoute middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};