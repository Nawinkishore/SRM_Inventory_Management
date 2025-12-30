import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connectDb } from "./db/connectDb.js";

import productRoutes from "./routes/product.route.js";
import excelRoutes from "./routes/excel.route.js";
import itemRoutes from "./routes/item.route.js";
import invoiceRoutes from "./routes/invoice.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [process.env.CLIENT_URL,
    "https://srm-frontend-4xed.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Default Route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// API Routes

app.use("/api/products", productRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/invoice", invoiceRoutes);

// START SERVER
app.listen(PORT, () => {
  connectDb();
  console.log(`Server running on port: ${PORT}`);
});
