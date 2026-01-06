import express from 'express';
import { 
  getProducts, 
  getProductInfinite,
  getItemById,
  updateProduct,
  getProductStats,
  createProduct
} from '../controllers/product.controller.js';

const router = express.Router();

// IMPORTANT: More specific routes must come before dynamic routes
router.post("/create", createProduct);
router.get('/getProducts', getProducts);
router.get("/infinite", getProductInfinite);
router.get("/stats", getProductStats);
router.patch("/:id", updateProduct);
router.get("/:id", getItemById);

export default router;