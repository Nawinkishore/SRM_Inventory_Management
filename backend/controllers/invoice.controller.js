import Invoice from "../models/saveInvoice.model.js";
export const createInvoice = async (req, res) => {
  const invoiceData = req.body;
  try{
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    return  res.status(200).json({ success: true, message: "Invoice created successfully" });
  }catch(error){
    return res.status(500).json({ success: false, message: "Failed to create invoice", error: error.message });
  }
};
export const getInvoices = async (req,res)=>{
  const { UserId } = req.body;
  try{
    const invoices = await Invoice.find({ UserId });
    return res.status(200).json({ success: true, invoices });
  }catch(error){
    return res.status(500).json({ success: false, message: "Failed to fetch invoices", error: error.message });
  }
}