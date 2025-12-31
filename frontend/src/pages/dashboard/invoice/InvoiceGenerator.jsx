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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Invoice Type State
  const [invoiceType, setInvoiceType] = React.useState("job-card");
  const [invoiceDate, setInvoiceDate] = React.useState();

  // Customer State
  const [customerDetails, setCustomerDetails] = React.useState({
    name: "",
    phone: "",
  });

  // Vehicle State (only for job-card)
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

  const [searchText, setSearchText] = React.useState("");
  const debouncedSearch = useDebounce(searchText, 400);
  const [items, setItems] = React.useState([]);
  const shouldSearch = debouncedSearch && debouncedSearch.trim().length > 0;
  const { data: productsResponse, isLoading: searchLoading } = useProductSearch(
    shouldSearch ? debouncedSearch : null
  );
  const products = productsResponse?.data || productsResponse || [];

  const parseNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const getRate = (item) => {
    const mrp = Number(item.MRP) || 0;
    const gst = Number(item.gst) || 0;

    if (!gst) return mrp;
    return mrp / (1 + gst / 100);
  };

  const itemFinalAmount = (item) => {
    const mrp = Number(item.MRP) || 0;
    const qty = Number(item.quantity) || 0;
    return mrp * qty;
  };

  const totalAmount = items.reduce((sum, item) => {
    return sum + itemFinalAmount(item);
  }, 0);

  const isDuplicateProduct = (productId) => {
    return items.some((item) => item._id === productId);
  };

  useEffect(() => {
    const paid = Number(amountPaid) || 0;

    if (paid > totalAmount) {
      setAmountPaid(String(totalAmount));
    }

    if (paid < 0) {
      setAmountPaid("0");
    }
  }, [amountPaid, totalAmount]);

  const handleAddProduct = (product) => {
    if (isDuplicateProduct(product._id)) {
      toast.error("Product Already Added!");
      return;
    }
    const newItem = {
      partName: product.partName || "",
      partNo: product.partNo || "",
      largeGroup: product.largeGroup || "",
      tariff: product.tariff || "",
      MRP: product.revisedMRP,
      quantity: 1,
      gst: product.IGSTCode,
      rate: Number(
        (product.revisedMRP / (1 + product.IGSTCode / 100)).toFixed(2)
      ),
    };

    setItems([...items, newItem]);

    setSearchText("");
    toast.success("Product Added");
  };

  const updateItemField = (index, field, value) => {
    const updated = [...items];

    if (field === "quantity") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else if (field === "gst" || field === "MRP") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }

    setItems(updated);
  };

  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    toast.info("Item Removed");
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

    const paid = Number(amountPaid) || 0;
    const balance = Math.max(totalAmount - paid, 0);

    const payload = {
      invoiceNumber,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      invoiceType,

      customer: {
        name: customerDetails.name.trim(),
        phone: customerDetails.phone.trim(),
      },

      vehicle:
        invoiceType === "job-card"
          ? {
              registrationNumber: vehicleDetails.registrationNumber || null,
              frameNumber: vehicleDetails.frameNumber || null,
              model: vehicleDetails.model || null,
              nextServiceKm: vehicleDetails.nextServiceKm
                ? Number(vehicleDetails.nextServiceKm)
                : null,
              nextServiceDate: vehicleDetails.nextServiceDate
                ? new Date(vehicleDetails.nextServiceDate)
                : null,
            }
          : undefined,

      items: items.map((item) => ({
        partNo: item.partNo || "",
        partName: item.partName || "",
        largeGroup: item.largeGroup || "",
        tariff: item.tariff || "",
        MRP: Number(item.MRP) || 0,
        quantity: Number(item.quantity) || 1,
        gst: Number(item.gst) || 0,
        rate: Number(getRate(item).toFixed(2)),
      })),

      totalAmount,
      amountPaid: paid,
      balanceDue: balance,

      amountType,

      invoiceStatus: balance === 0 ? "completed" : "pending",
    };

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
      setInvoiceType("job-card");
      setSearchText("");
    } catch (error) {
      toast.error("Failed to Create Invoice", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const showVehicleDetails = invoiceType === "job-card";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Invoice Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Number
              </label>
              <Input
                type="text"
                value={invoiceNumber || "Loading..."}
                disabled
                className="bg-gradient-to-r from-blue-50 to-indigo-50 font-mono text-lg font-bold border-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Date
              </label>
              <Input
                onChange={(e) => setInvoiceDate(e.target.value)}
                value={invoiceDate}
                type="date"
                className="bg-slate-50 font-mono text-lg border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Type
              </label>
              <Select
                value={invoiceType}
                onValueChange={(value) => setInvoiceType(value)}
                className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Invoice Type"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job-card">Job Card</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            Customer Details
          </h2>

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
                type="tel"
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              Vehicle Details
            </h2>

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
                  placeholder="e.g., Honda Activa"
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
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Next Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Next Service KM
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 5000"
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
            Search Products
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by part name, part number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 text-base border-slate-300"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {searchLoading && (
            <div className="mt-3 text-center text-slate-500">Searching...</div>
          )}

          {shouldSearch && !searchLoading && products.length > 0 && (
            <div className="mt-4 max-h-80 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleAddProduct(p)}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {p.partName}
                      </h3>
                      <div className="flex gap-4 mt-1 text-sm text-slate-600">
                        <span>
                          <span className="font-medium">Part No:</span>{" "}
                          {p.partNo}
                        </span>
                        <span>
                          <span className="font-medium">HSN:</span>{" "}
                          {p.tariff || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ₹{parseNum(p.revisedMRP).toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm text-slate-600">
                        GST: {p.IGSTCode}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shouldSearch && !searchLoading && products.length === 0 && (
            <div className="mt-4 text-center py-8 text-slate-500">
              No products found for "{searchText}"
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Invoice Items
            </h2>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-center">S.No</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Part No</TableHead>
                  <TableHead className="text-center">HSN</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">
                    Rate (excl. GST)
                  </TableHead>
                  <TableHead className="text-center">GST %</TableHead>
                  <TableHead className="text-center">MRP</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <FileText className="w-16 h-16 mb-3 opacity-50" />
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
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.partName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.partNo}
                      </TableCell>
                      <TableCell className="text-center">
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
                      <TableCell className="text-center">
                        <Input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, "");
                            updateItemField(index, "quantity", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || Number(e.target.value) < 1) {
                              updateItemField(index, "quantity", 1);
                            }
                          }}
                          className="min-w-[70px]"
                          placeholder="1"
                        />
                      </TableCell>

                      <TableCell className="text-center font-medium text-blue-600">
                        ₹
                        {getRate(item).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell className="text-center">
                        <Input
                          type="text"
                          value={item.gst}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "gst", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value)
                              updateItemField(index, "gst", 0);
                          }}
                          className="min-w-[80px]"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        <Input
                          type="text"
                          value={itemFinalAmount(item)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(index, "MRP", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value)
                              updateItemField(index, "MRP", 0);
                          }}
                          className="min-w-[80px]"
                          placeholder="0"
                        />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
            Payment Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
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
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6 text-white">
          <h2 className="text-2xl font-bold mb-6">Invoice Summary</h2>
          <div className="mt-2">
            <h1 className="font-bold">Total Amount</h1>
            <p className="text-3xl font-extrabold">
              ₹ {totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 mt-5">
              {" "}
              Amount Paid
            </label>
            <Input
              type="text"
              placeholder="Enter amount paid"
              value={amountPaid}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d.]/g, "");
                if (value === "") value = "";
                setAmountPaid(value);
              }}
              onBlur={() => {
                const paid = Number(amountPaid);

                if (!amountPaid || isNaN(paid)) {
                  setAmountPaid("0");
                  return;
                }

                if (paid > totalAmount) {
                  setAmountPaid(String(totalAmount));
                  toast.info(
                    "Amount paid cannot exceed total. Adjusted to total."
                  );
                }

                if (paid < 0) setAmountPaid("0");
              }}
              className="border-slate-300"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={createInvoiceMutation.isPending}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Submit Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
