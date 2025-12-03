export const calculateTotals = (invoice) => {
  let subTotal = 0,
      totalDiscount = 0,
      totalTax = 0,
      grandTotal = 0;

  invoice.items.forEach(item => {
    const base = item.revisedMRP * item.quantity;
    const afterDiscount = base - item.discount;

    const cgst = afterDiscount * (item.CGSTCode / 100);
    const sgst = afterDiscount * (item.SGSTCode / 100);
    const igst = afterDiscount * (item.IGSTCode / 100);

    item.taxAmount = cgst + sgst + igst;
    item.finalAmount = afterDiscount + item.taxAmount;

    subTotal += base;
    totalDiscount += item.discount;
    totalTax += item.taxAmount;
    grandTotal += item.finalAmount;
  });

  invoice.totals = {
    subTotal,
    totalDiscount,
    totalTax,
    grandTotal: Math.round(grandTotal),
    roundOff: Math.round(grandTotal) - grandTotal,
  };
};
