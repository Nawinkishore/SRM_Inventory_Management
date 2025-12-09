import React from "react";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  useNextInvoiceNumber,
  useCreateInvoice,
} from "@/features/invoice/useInvoice";
import { useProductSearch } from "@/features/products/useProduct";

const InvoiceGenerator = () => {
  const { data: invoiceNumber } = useNextInvoiceNumber();
  const createInvoiceMutation = useCreateInvoice();

  const now = new Date();
  const formatedDate =
    now.getDate().toString().padStart(2, "0") +
    "/" +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    now.getFullYear();

  // Invoice Type State
  const [invoiceType, setInvoiceType] = React.useState("sales");

  // Customer State
  const [customerDetails, setCustomerDetails] = React.useState({
    name: "",
    phone: "",
  });

  // Vehicle State (only for job-card)
  const [vehicleDetails, setVehicleDetails] = React.useState({
    nextServiceKm: "",
    nextServiceDate: "",
  });

  // Payment State
  const [amountType, setAmountType] = React.useState("cash");
  const [amountPaid, setAmountPaid] = React.useState(0);

  // Rows
  const [rows, setRows] = React.useState([
    { search: "", product: null, quantity: 1, tariff: "", discount: 0 },
  ]);

  const [activeRow, setActiveRow] = React.useState(null);
  const [search, setSearch] = React.useState("");

  // API search
  const { data: products = [] } = useProductSearch(search);

  // Helper: taxable amount (price * qty - discount)
  const getTaxableAmount = (row) => {
    if (!row.product) return 0;
    const price = Number(row.product.revisedMRP || 0);
    const qty = Number(row.quantity || 0);
    const discount = Number(row.discount || 0);
    const taxable = price * qty - discount;
    return taxable > 0 ? taxable : 0;
  };

  // Row-wise CGST / SGST / IGST amounts using rule:
  // IF IGSTCode > 0 → apply IGST only
  // ELSE → apply CGST + SGST
  const rowCGSTAmount = (row) => {
    if (!row.product) return 0;
    const igstRate = Number(row.product.IGSTCode || 0);
    if (igstRate > 0) return 0; // IGST case → no CGST
    const rate = Number(row.product.CGSTCode || 0);
    const taxable = getTaxableAmount(row);
    return (taxable * rate) / 100;
  };

  const rowSGSTAmount = (row) => {
    if (!row.product) return 0;
    const igstRate = Number(row.product.IGSTCode || 0);
    if (igstRate > 0) return 0; // IGST case → no SGST
    const rate = Number(row.product.SGSTCode || 0);
    const taxable = getTaxableAmount(row);
    return (taxable * rate) / 100;
  };

  const rowIGSTAmount = (row) => {
    if (!row.product) return 0;
    const rate = Number(row.product.IGSTCode || 0);
    if (rate <= 0) return 0;
    const taxable = getTaxableAmount(row);
    return (taxable * rate) / 100;
  };

  const rowGST = (row) =>
    rowCGSTAmount(row) + rowSGSTAmount(row) + rowIGSTAmount(row);

  const rowTotalBeforeTax = (row) => getTaxableAmount(row);

  const rowFinalAmount = (row) => rowTotalBeforeTax(row) + rowGST(row);

  // Search handler
  const handleSearchChange = (index, value) => {
    const updated = [...rows];
    updated[index].search = value;

    // If search becomes empty → reset this row completely
    if (!value.trim()) {
      updated[index] = {
        search: "",
        product: null,
        quantity: 1,
        tariff: "",
        discount: 0,
      };
      setRows(updated);
      setSearch("");
      setActiveRow(null);
      return;
    }

    setRows(updated);
    setActiveRow(index);
    setSearch(value);
  };

  // Prevent duplicate
  const isDuplicateProduct = (productId) => {
    return rows.some((r) => r.product?._id === productId);
  };

  // Select product
  const handleSelectProduct = (index, product) => {
    if (isDuplicateProduct(product._id)) {
      toast.error("Product Already Added!", {
        description: "This product is already in the invoice list.",
      });
      return;
    }

    const updated = [...rows];
    updated[index].product = product;
    updated[index].search = product.partName + " " + product.partNo;
    updated[index].tariff = product.tariff || "";
    updated[index].quantity = 1;
    updated[index].discount = 0;

    setRows(updated);
    setSearch("");
    setActiveRow(null);

    toast.success("Product Added", {
      description: `${product.partName} has been added to invoice.`,
    });
  };

  // Update row field
  const updateField = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // Delete row
  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(
      updated.length > 0
        ? updated
        : [{ search: "", product: null, quantity: 1, tariff: "", discount: 0 }]
    );

    toast.info("Item Removed", {
      description: "Item has been removed from the invoice.",
    });
  };

  // Add row
  const addRow = () => {
    setRows([
      ...rows,
      { search: "", product: null, quantity: 1, tariff: "", discount: 0 },
    ]);
    toast.success("New Row Added", {
      description: "You can now add another product.",
    });
  };

  // SUBTOTAL & GST TOTAL
  const subTotal = rows.reduce((sum, r) => sum + rowTotalBeforeTax(r), 0);
  const totalDiscount = rows.reduce(
    (sum, r) => sum + Number(r.discount || 0),
    0
  );
  const GSTTotal = rows.reduce((sum, r) => sum + rowGST(r), 0);

  const grandTotal = subTotal + GSTTotal;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  // Calculate balance due
  const balanceDue = Math.max(0, roundedTotal - Number(amountPaid || 0));

  const generateInvoicePayload = () => {
    return {
      invoiceNumber,
      invoiceDate: new Date(),
      invoiceType,

      customer: {
        name: customerDetails.name,
        phone: customerDetails.phone,
      },

      vehicle:
        invoiceType === "job-card"
          ? {
              nextServiceKm: vehicleDetails.nextServiceKm
                ? Number(vehicleDetails.nextServiceKm)
                : null,
              nextServiceDate: vehicleDetails.nextServiceDate
                ? new Date(vehicleDetails.nextServiceDate)
                : null,
            }
          : {
              nextServiceKm: null,
              nextServiceDate: null,
            },

      items: rows
        .filter((r) => r.product)
        .map((r) => {
          const cgstAmount = rowCGSTAmount(r);
          const sgstAmount = rowSGSTAmount(r);
          const igstAmount = rowIGSTAmount(r);
          const taxAmount = rowGST(r);
          const finalAmount = rowFinalAmount(r);

          return {
            partNo: r.product?.partNo || "",
            partName: r.product?.partName || "",
            largeGroup: r.product?.largeGroup || "",
            tariff: r.tariff || r.product?.tariff || 0,
            revisedMRP: r.product?.revisedMRP || 0,
            hsnCode: r.product?.hsnCode || "",

            CGSTCode: r.product?.CGSTCode || 0,
            SGSTCode: r.product?.SGSTCode || 0,
            IGSTCode: r.product?.IGSTCode || 0,

            quantity: Number(r.quantity),
            discount: Number(r.discount || 0),

            cgstAmount: Number(cgstAmount.toFixed(2)),
            sgstAmount: Number(sgstAmount.toFixed(2)),
            igstAmount: Number(igstAmount.toFixed(2)),
            taxAmount: Number(taxAmount.toFixed(2)),
            finalAmount: Number(finalAmount.toFixed(2)),
          };
        }),

      totals: {
        subTotal: Number(subTotal.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        totalTax: Number(GSTTotal.toFixed(2)),
        grandTotal: Number(roundedTotal.toFixed(2)),
        roundOff: Number(roundOff.toFixed(2)),
      },

      amountPaid: Number(amountPaid || 0),
      balanceDue: Number(balanceDue.toFixed(2)),
      amountType,
    };
  };

  const handleSubmit = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      toast.error("Missing Customer Details", {
        description: "Please enter customer name and phone number.",
      });
      return;
    }

    if (customerDetails.phone.length !== 10) {
      toast.error("Invalid Phone Number", {
        description: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    if (!rows.some((r) => r.product)) {
      toast.error("No Products Added", {
        description: "Please add at least one product.",
      });
      return;
    }

    if (Number(amountPaid) > roundedTotal) {
      toast.error("Invalid Amount Paid", {
        description: "Amount paid cannot exceed the grand total.",
      });
      return;
    }

    const payload = generateInvoicePayload();

    try {
      await createInvoiceMutation.mutateAsync(payload);

      toast.success("Invoice Created Successfully!", {
        description: `Invoice ${invoiceNumber} has been created.`,
      });

      // Reset form
      setCustomerDetails({ name: "", phone: "" });
      setVehicleDetails({ nextServiceKm: "", nextServiceDate: "" });
      setRows([
        { search: "", product: null, quantity: 1, tariff: "", discount: 0 },
      ]);
      setAmountPaid(0);
      setAmountType("cash");
      setInvoiceType("sales");
    } catch (error) {
      toast.error("Failed to Create Invoice", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const showVehicleDetails = invoiceType === "job-card";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Invoice Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Number
              </label>
              <Input
                type="text"
                value={invoiceNumber || ""}
                readOnly
                className="bg-slate-50 font-mono text-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Date
              </label>
              <Input
                type="text"
                value={formatedDate}
                readOnly
                className="bg-slate-50 font-mono text-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Type
              </label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Sales</option>
                <option value="advance">Advance</option>
                <option value="job-card">Job Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
            Customer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name *
              </label>
              <Input
                type="text"
                placeholder="Enter customer name"
                value={customerDetails.name}
                onChange={(e) =>
                  setCustomerDetails({
                    ...customerDetails,
                    name: e.target.value,
                  })
                }
                className="border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number * (10 digits)
              </label>
              <Input
                type="text"
                placeholder="Enter phone number"
                value={customerDetails.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setCustomerDetails({
                    ...customerDetails,
                    phone: value,
                  });
                }}
                className="border-slate-300"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details - Only for Job Card */}
        {showVehicleDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
              Vehicle Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Service KM
                </label>
                <Input
                  type="number"
                  placeholder="Enter next service KM"
                  value={vehicleDetails.nextServiceKm}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      nextServiceKm: e.target.value,
                    })
                  }
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Service Date
                </label>
                <Input
                  type="date"
                  value={vehicleDetails.nextServiceDate}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      nextServiceDate: e.target.value,
                    })
                  }
                  className="border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
            Invoice Items
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <caption className="text-slate-600 text-sm py-2">
                Product List
              </caption>

              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <TableHead className="text-white font-bold">Item</TableHead>
                  <TableHead className="text-white font-bold">HSN</TableHead>
                  <TableHead className="text-white font-bold">Qty</TableHead>
                  <TableHead className="text-white font-bold">Price</TableHead>
                  <TableHead className="text-white font-bold">
                    Discount
                  </TableHead>
                  <TableHead className="text-white font-bold">CGST %</TableHead>
                  <TableHead className="text-white font-bold">SGST %</TableHead>
                  <TableHead className="text-white font-bold">Total</TableHead>
                  <TableHead className="text-white font-bold text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((item, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {/* SEARCH FIELD */}
                    <TableCell className="relative">
                      <Input
                        type="text"
                        placeholder="Search…"
                        value={item.search}
                        onChange={(e) =>
                          handleSearchChange(index, e.target.value)
                        }
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasteText = e.clipboardData
                            .getData("text")
                            .trim();
                          handleSearchChange(index, pasteText);
                        }}
                        className="min-w-[200px]"
                      />

                      {activeRow === index &&
                        search.length > 0 &&
                        products.length > 0 && (
                          <div className="absolute z-50 bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-h-60 overflow-auto mt-1 left-0">
                            {products.map((p) => (
                              <div
                                key={p._id}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelectProduct(index, p)}
                              >
                                <div className="font-semibold text-slate-800 text-sm">
                                  {p.partName}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {p.partNo}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">
                                  ₹{p.revisedMRP?.toLocaleString("en-IN")}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </TableCell>

                    {/* HSN */}
                    <TableCell>
                      <Input
                        value={item.tariff}
                        onChange={(e) =>
                          updateField(index, "tariff", e.target.value)
                        }
                        className="min-w-[90px]"
                      />
                    </TableCell>

                    {/* QTY */}
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateField(
                            index,
                            "quantity",
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="min-w-[70px]"
                      />
                    </TableCell>

                    {/* PRICE */}
                    <TableCell className="font-semibold text-slate-800 min-w-[90px]">
                      {item.product
                        ? `₹${item.product.revisedMRP?.toLocaleString("en-IN")}`
                        : "-"}
                    </TableCell>

                    {/* DISCOUNT */}
                    <TableCell>
                      <Input
                        type="number"
                        value={item.discount || ""}
                        min={0}
                        onChange={(e) => {
                          const v =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          updateField(index, "discount", Math.max(0, v));
                        }}
                        className="min-w-[90px]"
                      />
                    </TableCell>

                    {/* CGST % */}
                    <TableCell className="font-semibold text-blue-600">
                      {item.product ? `${item.product.CGSTCode}%` : "-"}
                    </TableCell>

                    {/* SGST % */}
                    <TableCell className="font-semibold text-blue-600">
                      {item.product ? `${item.product.SGSTCode}%` : "-"}
                    </TableCell>

                    {/* TOTAL */}
                    <TableCell className="font-bold text-green-600 min-w-[100px]">
                      ₹
                      {rowFinalAmount(item).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* DELETE */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => deleteRow(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Row */}
          <button
            onClick={addRow}
            className="mt-4 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
            Payment Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAmountType("cash")}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    amountType === "cash"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setAmountType("credit")}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    amountType === "credit"
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Credit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount Paid (Max: ₹{roundedTotal.toLocaleString("en-IN")})
              </label>
              <Input
                type="number"
                min={0}
                max={roundedTotal}
                placeholder="Enter amount paid"
                value={amountPaid || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > roundedTotal) {
                    toast.error("Amount Exceeds Total", {
                      description: "Amount paid cannot exceed grand total.",
                    });
                    setAmountPaid(roundedTotal);
                  } else {
                    setAmountPaid(Math.max(0, value));
                  }
                }}
                className="border-slate-300 text-lg font-semibold"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-700">
                Balance Due:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ₹
                {balanceDue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-2xl shadow-xl p-6 mb-6 text-white border border-indigo-800">
          <h3 className="text-xl font-bold mb-4">Invoice Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-slate-300 text-base">Subtotal:</span>
              <span className="text-lg font-semibold">
                ₹
                {subTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-300 text-base">
                  Total Discount:
                </span>
                <span className="text-lg font-semibold text-green-400">
                  -₹
                  {totalDiscount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-slate-300 text-base">Total GST:</span>
              <span className="text-lg font-semibold text-orange-400">
                ₹
                {GSTTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-slate-300 text-base">Round Off:</span>
              <span className="text-lg font-semibold">
                ₹
                {roundOff.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 bg-slate-950 bg-opacity-50 rounded-xl p-4 mt-3">
              <span className="text-xl font-bold">Grand Total:</span>
              <span className="text-3xl font-bold text-green-400">
                ₹{roundedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={createInvoiceMutation.isPending}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Submit Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
