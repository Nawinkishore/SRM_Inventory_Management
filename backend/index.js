import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend URL
    credentials: true, // to allow cookies to be sent
}));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());  // Middleware to parse cookies
app.listen(PORT, () => {
    connectDb();
    console.log(`Server is running on http://localhost:${PORT}`);
});   
app.use('/api/auth',authRoutes)
app.use('/api/products', productRoutes);
