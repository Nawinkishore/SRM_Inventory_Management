import Invoice from "../models/invoice.model.js";
export const generateInvoiceNumber = async (type) => {
  let prefix = "";
  if (type === "job-card") prefix = "JC";
  else if (type === "sales") prefix = "SI";
  else if (type === "advance") prefix = "AD";
  else throw new Error("Invalid invoice type");
  const last = await Invoice.find({ invoiceType: type })
    .sort({ createdAt: -1 })
    .limit(1);
  let nextNum = 1;
  if (last.length && last[0].invoiceNumber) {
    const split = last[0].invoiceNumber.split("-");
    nextNum = parseInt(split[1]) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(4, "0")}`;
};
