import Quotation from "../models/quotation.model.js";

export const createQuotation = async (req, res) => {
  const data = req.body;
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const find = await Quotation.findOne({ quotationNumber: `QT-${data.customer.name}-${randomNumber}` });
  if (find) {
    return res.status(400).json({
      success: false,
      message: "Quotation number already exists, please try again",
    });
  }
  const updatedData = {
    ...data,
    quotationNumber: `QT-${data.customer.name}-${randomNumber}`,
  };

  try {
    const quotation = new Quotation(updatedData);
    await quotation.save();
    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message,
    });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Quotation.countDocuments();
    const quotations = await Quotation.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Quotations retrieved successfully",
      data: quotations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve quotations",
      error: error.message,
    });
  }
};

export const getQuotationById = async (req, res) => {
  const { id } = req.params;
  try {
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Quotation retrieved successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve quotation",
      error: error.message,
    });
  }
};

export const updateQuotationById = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const quotation = await Quotation.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

export const deleteQuotationById = async (req, res) => {
  const { id } = req.params;
  try {
    const foundQuotation = await Quotation.findById(id);
    if (!foundQuotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }
    await Quotation.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message: "Failed to delete quotation",
      error: error.message,
    })
  }
};
