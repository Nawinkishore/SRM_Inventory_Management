import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getStockSummary
} from "../controllers/item.controller.js";

const router = express.Router();

router.post("/", createItem);
router.get("/", getItems);
router.get("/summary", getStockSummary);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
