import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  const { partNo, partName, tariff, GST, stock, salePrice, purchasePrice, MRP } = req.body;
  
  try {
    // Validate required fields
    if (!partNo || !partName) {
      return res.status(400).json({ 
        success: false, 
        message: "Part Number and Part Name are required" 
      });
    }

    // Check if product with same partNo already exists
    const existingProduct = await Product.findOne({ partNo });
    if (existingProduct) {
      return res.status(400).json({ 
        success: false, 
        message: "Product with this Part Number already exists" 
      });
    }

    const newProduct = new Product({
      partNo,
      partName,
      largeGroup: "Yamaha Genuine Parts",
      tariff: tariff || 0,
      CGSTCode: GST ? GST / 2 : 0,
      SGSTCode: GST ? GST / 2 : 0,
      IGSTCode: GST || 0,
      stock: stock || 0,
      salePrice: salePrice || 0,
      purchasePrice: purchasePrice || 0,
      revisedMRP: MRP || 0
    });

    await newProduct.save();
    
    return res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      product: newProduct
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create product" 
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { partName: { $regex: search, $options: "i" } },
          { partNo: { $regex: search, $options: "i" } },
        ],
      };
    }
    const products = await Product.find(query).limit(50);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getProductInfinite = async (req, res) => {
  try {
    const { search = "", lastId = null, limit = 30 } = req.query;
    
    let query = {};
    
    // Build search query
    if (search && search.trim()) {
      query.$or = [
        { partName: { $regex: search, $options: "i" } },
        { partNo: { $regex: search, $options: "i" } },
      ];
    }
    
    // Add pagination cursor
    if (lastId) {
      if (query.$or) {
        // If search exists, combine with lastId
        query = {
          $and: [
            { $or: query.$or },
            { _id: { $gt: lastId } }
          ]
        };
      } else {
        query._id = { $gt: lastId };
      }
    }
    
    // Get total count for the current query
    const totalItems = await Product.countDocuments(
      search && search.trim() 
        ? { $or: [
            { partName: { $regex: search, $options: "i" } },
            { partNo: { $regex: search, $options: "i" } },
          ]} 
        : {}
    );
    
    const products = await Product.find(query)
      .sort({ _id: 1 })
      .limit(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      products,
      lastId: products.length > 0 ? products[products.length - 1]._id : null,
      totalItems,
      hasMore: products.length === parseInt(limit),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Product.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    return res.status(200).json({ success: true, item });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { 
      new: true 
    });
    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    return res.status(200).json({ success: true, updatedProduct });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getProductStats = async (req, res) => {
  try {
    const totalItems = await Product.countDocuments();
    
    // Count items with stock = 0 (out of stock)
    const outOfStockItems = await Product.countDocuments({ 
      $or: [
        { stock: 0 },
        { stock: { $exists: false } }
      ]
    });
    
    // Low stock = items with stock > 0 but < 10
    const lowStockItems = await Product.countDocuments({ 
      stock: { $gt: 0, $lt: 10 } 
    });
    
    const stockValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$stock", "$purchasePrice"] }
          }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      statistics: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalStockValue: stockValue[0]?.totalValue || 0,
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    return res.status(200).json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}