import React from "react";
import { Input } from "@/components/ui/input";
import { Trash2, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

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

  // Vehicle State (only for job-card) - UPDATED WITH SERVICE DETAILS
  const [vehicleDetails, setVehicleDetails] = React.useState({
    registrationNumber: "",
    frameNumber: "",
    model: "",
    nextServiceKm: "",
    nextServiceDate: "",
  });

  // Payment State
  const [amountType, setAmountType] = React.useState("cash");
  const [amountPaid, setAmountPaid] = React.useState("");

  // Separate search state
  const [searchText, setSearchText] = React.useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  // Items/rows that have been added
  const [items, setItems] = React.useState([]);

  // API search - only call when there's actually text to search
  const shouldSearch = debouncedSearch && debouncedSearch.trim().length > 0;
  const { data: productsResponse, isLoading: searchLoading } = useProductSearch(
    shouldSearch ? debouncedSearch : null
  );

  // Extract products array from response
  const products = productsResponse?.data || productsResponse || [];

  // Helper: parse number from string (handles empty strings)
  const parseNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Helper: taxable amount (price * qty - discount)
  const getTaxableAmount = (item) => {
    const price = parseNum(item.price);
    const qty = parseNum(item.quantity);
    const discount = parseNum(item.discount);
    return Math.max(0, price * qty - discount);
  };

  const itemGSTAmount = (item) => {
    const taxable = getTaxableAmount(item);
    const gstRate = parseNum(item.gstRate);
    return (taxable * gstRate) / 100;
  };

  const itemCGSTAmount = (item) => {
    return itemGSTAmount(item) / 2;
  };

  const itemSGSTAmount = (item) => {
    return itemGSTAmount(item) / 2;
  };

  const itemFinalAmount = (item) => getTaxableAmount(item) + itemGSTAmount(item);
  const itemTotalBeforeTax = (item) => getTaxableAmount(item);

  // Prevent duplicate
  const isDuplicateProduct = (productId) => {
    return items.some((item) => item._id === productId);
  };

  // Add product to items list
  const handleAddProduct = (product) => {
    if (isDuplicateProduct(product._id)) {
      toast.error("Product Already Added!", {
        description: "This product is already in the invoice list.",
      });
      return;
    }

    // Calculate combined GST rate
    const cgst = parseNum(product.CGSTCode);
    const sgst = parseNum(product.SGSTCode);
    const combinedGST = cgst + sgst;

    const newItem = {
      _id: product._id,
      partName: product.partName || "",
      partNo: product.partNo || "",
      largeGroup: product.largeGroup || "",
      hsnCode: product.hsnCode || "",
      
      // Editable fields - stored as strings
      quantity: "1",
      price: String(parseNum(product.revisedMRP)),
      discount: "0",
      tariff: product.tariff || "",
      gstRate: String(combinedGST),

      // Original values for reference
      revisedMRP: product.revisedMRP || 0,
      originalGSTRate: combinedGST,
    };

    setItems([...items, newItem]);
    setSearchText("");

    toast.success("Product Added", {
      description: `${product.partName} has been added to invoice.`,
    });
  };

  // Update item field
  const updateItemField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Delete item
  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);

    toast.info("Item Removed", {
      description: "Item has been removed from the invoice.",
    });
  };

  // SUBTOTAL & GST TOTAL
  const subTotal = items.reduce(
    (sum, item) => sum + itemTotalBeforeTax(item),
    0
  );
  const totalDiscount = items.reduce(
    (sum, item) => sum + parseNum(item.discount),
    0
  );
  const GSTTotal = items.reduce((sum, item) => sum + itemGSTAmount(item), 0);

  const grandTotal = subTotal + GSTTotal;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  // Calculate balance due
  const balanceDue = Math.max(0, roundedTotal - parseNum(amountPaid));

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
              registrationNumber: vehicleDetails.registrationNumber || null,
              frameNumber: vehicleDetails.frameNumber || null,
              model: vehicleDetails.model || null,
              nextServiceKm: vehicleDetails.nextServiceKm ? Number(vehicleDetails.nextServiceKm) : null,
              nextServiceDate: vehicleDetails.nextServiceDate ? new Date(vehicleDetails.nextServiceDate) : null,
            }
          : {
              registrationNumber: null,
              frameNumber: null,
              model: null,
              nextServiceKm: null,
              nextServiceDate: null,
            },

      items: items.map((item) => {
        const gstRate = parseNum(item.gstRate);
        const cgstRate = gstRate / 2;
        const sgstRate = gstRate / 2;
        
        const cgstAmount = itemCGSTAmount(item);
        const sgstAmount = itemSGSTAmount(item);
        const taxAmount = itemGSTAmount(item);
        const finalAmount = itemFinalAmount(item);

        return {
          partNo: item.partNo || "",
          partName: item.partName || "",
          largeGroup: item.largeGroup || "",
          tariff: item.tariff || "",
          revisedMRP: parseNum(item.price),
          hsnCode: item.hsnCode || "",

          CGSTCode: cgstRate,
          SGSTCode: sgstRate,
          IGSTCode: 0,

          quantity: parseNum(item.quantity),
          discount: parseNum(item.discount),

          cgstAmount: Number(cgstAmount.toFixed(2)),
          sgstAmount: Number(sgstAmount.toFixed(2)),
          igstAmount: 0,
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

      amountPaid: parseNum(amountPaid),
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

    if (items.length === 0) {
      toast.error("No Products Added", {
        description: "Please add at least one product.",
      });
      return;
    }

    if (parseNum(amountPaid) > roundedTotal) {
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
      setVehicleDetails({
        registrationNumber: "",
        frameNumber: "",
        model: "",
        nextServiceKm: "",
        nextServiceDate: "",
      });
      setItems([]);
      setAmountPaid("");
      setAmountType("cash");
      setInvoiceType("sales");
      setSearchText("");
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

        {/* Vehicle Details - Only for Job Card - WITH SERVICE DETAILS */}
        {showVehicleDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
              Vehicle Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registration Number
                </label>
                <Input
                  type="text"
                  placeholder="e.g., TN01AB1234"
                  value={vehicleDetails.registrationNumber}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      registrationNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="border-slate-300 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frame Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter frame number"
                  value={vehicleDetails.frameNumber}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      frameNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="border-slate-300 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bike Model
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Hero Splendor"
                  value={vehicleDetails.model}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      model: e.target.value,
                    })
                  }
                  className="border-slate-300"
                />
              </div>
            </div>

            {/* Next Service Details */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-lg font-semibold text-slate-700 mb-3">
                Next Service Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Next Service KM
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter next service KM"
                    value={vehicleDetails.nextServiceKm}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setVehicleDetails({
                        ...vehicleDetails,
                        nextServiceKm: value,
                      });
                    }}
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
          </div>
        )}

        {/* Product Search - Separate Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
            Search Products
          </h3>

          <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search product by name or part number..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 text-base border-slate-300"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  Searching...
                </div>
              )}
            </div>

            {shouldSearch && !searchLoading && products.length > 0 && (
              <div className="absolute z-50 bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-h-80 overflow-auto mt-2">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => handleAddProduct(p)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {p.partName}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          Part No: {p.partNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          HSN: {p.hsnCode || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ₹{parseNum(p.revisedMRP).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          GST: {parseNum(p.CGSTCode) + parseNum(p.SGSTCode)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {shouldSearch && !searchLoading && products.length === 0 && (
              <div className="absolute z-50 bg-white border border-slate-300 rounded-lg shadow-lg w-full mt-2 p-4 text-center text-slate-500">
                No products found for "{searchText}"
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
            Invoice Items
            <span className="ml-auto text-sm font-normal text-slate-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <TableHead className="text-white font-bold">S.No</TableHead>
                  <TableHead className="text-white font-bold">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Part No
                  </TableHead>
                  <TableHead className="text-white font-bold">HSN</TableHead>
                  <TableHead className="text-white font-bold">Qty</TableHead>
                  <TableHead className="text-white font-bold">Price</TableHead>
                  <TableHead className="text-white font-bold">
                    Discount
                  </TableHead>
                  <TableHead className="text-white font-bold">GST %</TableHead>
                  <TableHead className="text-white font-bold">Total</TableHead>
                  <TableHead className="text-white font-bold text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-12 text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-slate-300" />
                        <p className="text-lg font-medium">
                          No items added yet
                        </p>
                        <p className="text-sm">
                          Search and add products to create an invoice
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-700">
                        {index + 1}
                      </TableCell>

                      <TableCell className="font-semibold text-slate-800 min-w-[200px]">
                        {item.partName}
                      </TableCell>

                      <TableCell className="text-slate-600 min-w-[120px]">
                        {item.partNo}
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={item.tariff}
                          onChange={(e) =>
                            updateItemField(index, "tariff", e.target.value)
                          }
                          className="min-w-[90px]"
                          placeholder="HSN"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "quantity", value || "0");
                          }}
                          className="min-w-[70px]"
                          placeholder="1"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={item.price}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "price", value);
                          }}
                          className="min-w-[100px]"
                          placeholder="Price"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={item.discount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "discount", value);
                          }}
                          className="min-w-[90px]"
                          placeholder="0"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={item.gstRate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "gstRate", value);
                          }}
                          className="min-w-[80px]"
                          placeholder="0"
                        />
                      </TableCell>

                      <TableCell className="font-bold text-green-600 min-w-[110px]">
                        ₹
                        {itemFinalAmount(item).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          onClick={() => deleteItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
                type="text"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  const numValue = parseNum(value);
                  
                  if (numValue > roundedTotal) {
                    toast.error("Amount Exceeds Total", {
                      description: "Amount paid cannot exceed grand total.",
                    });
                    setAmountPaid(String(roundedTotal));
                  } else {
                    setAmountPaid(value);
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
            disabled={createInvoiceMutation.isPending || items.length === 0}
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