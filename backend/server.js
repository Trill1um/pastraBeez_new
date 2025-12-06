import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - MUST be before routes
app.use(
  cors({
    // origin:
    //   process.env.FRONTEND_PRODUCTION_URL ||
    //   process.env.FRONTEND_DEVELOPMENT_URL,
    origin: true, // Reflect request origin
    credentials: true, // Allow cookies
  })
);

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin

//     if (!origin) {
//       console.log("No origin in request, allowing by default");
//       return callback(null, true);
//     }
//     const allowedOrigins = [
//       process.env.FRONTEND_PRODUCTION_URL,
//       process.env.FRONTEND_DEVELOPMENT_URL,
//       process.env.VITE_SERVER_PRODUCTION_URL,
//     ].filter(Boolean);
//     console.log(`Checking origin: ${origin} against allowed: ${allowedOrigins.join(', ')}`);
//     if (allowedOrigins.includes(origin)) {
//       console.log(`CORS allowed origin: ${origin}`);
//       callback(null, true);
//     } else {
//       console.log(`CORS blocked origin: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// }));


// JSON parsing middleware - MUST be before routes
app.use(express.json({ limit: "10mb" })); // Add limit for larger payloads
app.use(express.urlencoded({ extended: true }));

// Cookie parser - MUST be before routes
app.use(cookieParser());

// Debug middleware to log all requests
app.use((req, res, next) => {
  // console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

// Connect Routes - AFTER all middleware
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  // console.log("Server is running on port ", PORT);
  connectDB();
});
