import Item from "../models/item.model.js";

// CREATE
export const createItem = async (req, res) => {
  try {
    const { name, partNo, salePrice, purchasePrice, stock, gst } = req.body;

    if (!name || !partNo)
      return res.status(400).json({ message: "Name & Part No required" });

    const exists = await Item.findOne({ partNo });
    if (exists)
      return res.status(400).json({ message: "Part No already exists" });

    const item = await Item.create({
      name,
      partNo,
      salePrice,
      purchasePrice,
      stock: stock || 0,
      gst: gst || 18
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST + SEARCH + PAGINATION
export const getItems = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const q = req.query.q || "";

    const filter = q
      ? {
          $or: [
            { name: new RegExp(q, "i") },
            { partNo: new RegExp(q, "i") }
          ]
        }
      : {};

    const total = await Item.countDocuments(filter);

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Changed response structure to match frontend expectations
    res.json({
      data: items,  // Changed from 'items' to 'data'
      meta: {
        totalDocs: total,
        totalPages: Math.ceil(total / limit),
        page: page,
        limit: limit
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET BY ID
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE
export const deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// SUMMARY (Dashboard)

export const getStockSummary = async (req, res) => {
  try {
    const items = await Item.find();

    const totalQty = items.reduce((s, i) => s + i.stock, 0);
    const stockValue = items.reduce(
      (s, i) => s + i.purchasePrice * i.stock,
      0
    );

    res.json({ totalQty, stockValue }); // Changed from totalStockValue to stockValue
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};