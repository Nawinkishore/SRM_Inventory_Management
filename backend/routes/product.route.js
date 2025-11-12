import express from 'express';
import Product from '../import-excel/models/Product.js';

const router = express.Router();

router.get('/getProducts', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { partName: { $regex: search, $options: 'i' } },
          { partNo: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query).limit(50);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
