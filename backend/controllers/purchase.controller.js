import Purchase from "../models/purchase.model.js";

export const createPurchase = async (req, res) => {
  const { orderName, items } = req.body; // Removed userId
  try {
    if (!orderName) {
      return res.status(400).json({ message: "Order name is required" });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    const existingPurchase = await Purchase.findOne({ orderName });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ message: "Purchase with this order name already exists" });
    }

    const newPurchase = new Purchase({
      orderName,
      items,
    });

    const savedPurchase = await newPurchase.save();
    res.status(201).json({
      message: "Purchase created successfully",
      purchase: savedPurchase,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const nextPurchaseNumber = async (req, res) => {
  try {
    const lastPurchase = await Purchase.findOne().sort({ createdAt: -1 });

    let lastNumber = 0;

    if (lastPurchase && lastPurchase.orderName) {
      const parts = lastPurchase.orderName.split("-");
      lastNumber = parseInt(parts[1], 10) || 0;
    }

    const nextNumber = lastNumber + 1;
    const prefix = "PUR-";
    const nextNumberFormatted = `${prefix}${String(nextNumber).padStart(5, "0")}`;

    res.status(200).json({ nextPurchaseNumber: nextNumberFormatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPurchaseList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Removed userId, changed default limit to 10
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const totalPurchases = await Purchase.countDocuments(); // Removed userId filter
    const totalPages = Math.ceil(totalPurchases / limitNumber);

    const purchases = await Purchase.find() // Removed userId filter
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      purchases,
      pagination: {
        total: totalPurchases,
        currentPage: pageNumber,
        totalPages: totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getPurchaseById = async (req, res) => {
  const { purchaseId } = req.params;
  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.status(200).json({ purchase });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const updatePurchaseById = async (req, res) => {
  const { purchaseId } = req.params;
  const { orderName, items } = req.body;
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { orderName, items },
      { new: true }
    );
    if (!updatedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.status(200).json({
      message: "Purchase updated successfully",
      purchase: updatedPurchase,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const deletePurchasebyId = async (req, res) => {
  const { purchaseId } = req.params;
  try {
    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
    if (!deletedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};


