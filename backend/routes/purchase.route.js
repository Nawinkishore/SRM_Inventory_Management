import express from "express";
import { createPurchase ,getPurchaseList ,getPurchaseById ,deletePurchasebyId,updatePurchaseById} from "../controllers/purchase.controller.js";
const router = express.Router();
router.post('/create', createPurchase);
router.get('/list', getPurchaseList);
router.get('/:purchaseId', getPurchaseById);
router.put('/:purchaseId', updatePurchaseById);
router.delete('/delete/:purchaseId', deletePurchasebyId);
export default router;
