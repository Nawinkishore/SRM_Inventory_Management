import express from "express";
import { createPurchase ,getPurchaseList ,deletePurchasebyId} from "../controllers/purchase.controller.js";
const router = express.Router();
router.post('/create', createPurchase);
router.get('/list/:userId', getPurchaseList);
router.delete('/delete/:purchaseId', deletePurchasebyId);
export default router;
