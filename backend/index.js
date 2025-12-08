import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import excelRoutes from "./routes/excel.route.js";
import purchaseRoutes from "./routes/purchase.route.js";
import invoiceRoutes  from './routes/invoice.route.js'

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "https://srm-frontend-55p4.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Default Route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/purchase', purchaseRoutes); 
app.use('/api/invoice',invoiceRoutes);

// Start Server
app.listen(PORT, () => {
    connectDb();
    console.log(`Server running on http://localhost:${PORT}`);
});
