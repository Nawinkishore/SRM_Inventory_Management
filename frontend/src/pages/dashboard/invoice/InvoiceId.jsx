import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useInvoiceById,
  useUpdateInvoice,
  useDeleteInvoice,
} from "@/features/invoice/useInvoice";
import { useProductSearch } from "@/features/products/useProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  User,
  Receipt,
  Package,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// UI Wrappers
const Table = ({ children, ...props }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b bg-gradient-to-r from-blue-500 to-indigo-600" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
);

const TableHead = ({ children, ...props }) => (
  <th
    className="h-12 px-4 text-left align-middle font-bold text-white"
    {...props}
  >
    {children}
  </th>
);

const TableRow = ({ children, ...props }) => (
  <tr className="border-b transition-colors hover:bg-blue-50" {...props}>
    {children}
  </tr>
);

const TableCell = ({ children, ...props }) => (
  <td className="p-4 align-middle" {...props}>
    {children}
  </td>
);

// Helper functions
const parseNum = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Convert product into invoice item
const convertProductToItem = (product) => {
  const price = parseNum(product.revisedMRP);
  const qty = 1;
  const discount = 0;

  // Combined GST rate
  const cgst = parseNum(product.CGSTCode);
  const sgst = parseNum(product.SGSTCode);
  const gstRate = cgst + sgst;

  const taxable = price * qty - discount;
  const cgstAmount = (taxable * (gstRate / 2)) / 100;
  const sgstAmount = (taxable * (gstRate / 2)) / 100;
  const taxAmount = cgstAmount + sgstAmount;
  const finalAmount = taxable + taxAmount;

  return {
    partNo: product.partNo || "",
    partName: product.partName || "",
    largeGroup: product.largeGroup || "",
    tariff: product.tariff || "",
    revisedMRP: price,
    hsnCode: product.hsnCode || "",
    CGSTCode: gstRate / 2,
    SGSTCode: gstRate / 2,
    IGSTCode: 0,
    quantity: qty,
    discount: discount,
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    igstAmount: 0,
    taxAmount: Number(taxAmount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
  };
};

// Calculate totals from items
const calculateTotalsFromItems = (items = [], amountPaid = 0) => {
  let subTotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const qty = parseNum(item.quantity);
    const price = parseNum(item.revisedMRP);
    const discount = parseNum(item.discount);

    const taxable = Math.max(0, qty * price - discount);
    const gstRate = parseNum(item.CGSTCode) + parseNum(item.SGSTCode);
    const taxAmount = (taxable * gstRate) / 100;

    subTotal += taxable;
    totalDiscount += discount;
    totalTax += taxAmount;
  });

  const grandTotal = subTotal + totalTax;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;
  const balanceDue = Math.max(0, roundedTotal - parseNum(amountPaid));

  return {
    subTotal: Number(subTotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal: Number(roundedTotal.toFixed(2)),
    roundOff: Number(roundOff.toFixed(2)),
    balanceDue: Number(balanceDue.toFixed(2)),
  };
};

const InvoiceId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: fetchInvoice, isLoading } = useInvoiceById(id);
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [isEditing, setIsEditing] = useState(false);
  const [invoiceState, setInvoiceState] = useState(null);
  const [search, setSearch] = useState("");
  
  const shouldSearch = search && search.trim().length > 0;
  const { data: productsResponse, isLoading: searchLoading } = useProductSearch(
    shouldSearch ? search : null
  );
  const products = productsResponse?.data || productsResponse || [];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (fetchInvoice?.data) {
      setInvoiceState(fetchInvoice.data);
    }
  }, [fetchInvoice]);

  if (isLoading || !invoiceState)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const invoice = invoiceState;

  // Live totals
  const { subTotal, totalDiscount, totalTax, grandTotal, roundOff, balanceDue } =
    calculateTotalsFromItems(invoice.items, invoice.amountPaid);

  const totalItems = invoice.items.length;

  // Auto status preview
  const previewStatus =
    invoice.invoiceStatus === "canceled"
      ? "canceled"
      : balanceDue <= 0
      ? "completed"
      : "draft";

  // Add product -> invoice
  const addItemToInvoice = (product) => {
    const newItem = convertProductToItem(product);

    setInvoiceState((prev) => {
      if (prev.items.some((i) => i.partNo === newItem.partNo)) {
        toast.error("Item already exists");
        return prev;
      }
      toast.success("Item added to invoice");
      return { ...prev, items: [...prev.items, newItem] };
    });

    setSearch("");
  };

  // Update item field
  const updateItemField = (index, field, value) => {
    setInvoiceState((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };

      // Recalculate this item
      const item = items[index];
      const qty = parseNum(item.quantity);
      const price = parseNum(item.revisedMRP);
      const discount = parseNum(item.discount);
      const gstRate = parseNum(item.CGSTCode) + parseNum(item.SGSTCode);

      const taxable = Math.max(0, qty * price - discount);
      const cgstAmount = (taxable * (gstRate / 2)) / 100;
      const sgstAmount = (taxable * (gstRate / 2)) / 100;
      const taxAmount = cgstAmount + sgstAmount;
      const finalAmount = taxable + taxAmount;

      items[index] = {
        ...item,
        cgstAmount: Number(cgstAmount.toFixed(2)),
        sgstAmount: Number(sgstAmount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        finalAmount: Number(finalAmount.toFixed(2)),
      };

      return { ...prev, items };
    });
  };

  const deleteItem = (index) => {
    setInvoiceState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("Item removed");
  };

  const handleSave = async () => {
    try {
      // Recalculate totals before saving
      const calculatedTotals = calculateTotalsFromItems(
        invoice.items,
        invoice.amountPaid
      );

      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: {
          invoiceDate: invoice.invoiceDate,
          customer: invoice.customer,
          vehicle: invoice.vehicle,
          items: invoice.items.map((item) => ({
            ...item,
            quantity: parseNum(item.quantity),
            revisedMRP: parseNum(item.revisedMRP),
            discount: parseNum(item.discount),
          })),
          totals: {
            subTotal: calculatedTotals.subTotal,
            totalDiscount: calculatedTotals.totalDiscount,
            totalTax: calculatedTotals.totalTax,
            grandTotal: calculatedTotals.grandTotal,
            roundOff: calculatedTotals.roundOff,
          },
          amountPaid: parseNum(invoice.amountPaid),
          balanceDue: calculatedTotals.balanceDue,
          amountType: invoice.amountType,
        },
      });

      toast.success("Invoice updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save invoice");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice._id);
      toast.success("Invoice deleted");
      navigate("/dashboard/invoices");
    } catch {
      toast.error("Delete failed");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      canceled: "bg-red-100 text-red-800 border-red-300",
    };
    return map[status] || map.draft;
  };

  const invoiceDateFormatted = new Date(invoice.invoiceDate).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Receipt className="text-blue-600" size={28} />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Invoice Details
        </h1>

        <span
          className={`ml-auto px-4 py-2 rounded-lg border-2 font-semibold text-sm ${getStatusBadge(
            previewStatus
          )}`}
        >
          {previewStatus.toUpperCase()}
        </span>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between mb-6 flex-wrap gap-3">
        <Link to="/dashboard/invoices">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </Link>

        <div className="flex gap-2 flex-wrap">
          {!isEditing ? (
            <>
              {invoice.invoiceStatus !== "canceled" && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit size={16} className="mr-2" /> Edit
                </Button>
              )}

              {invoice.invoiceStatus !== "canceled" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateInvoice
                      .mutateAsync({
                        id: invoice._id,
                        data: { invoiceStatus: "canceled" },
                      })
                      .then(() => toast.success("Invoice canceled"))
                  }
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X size={16} className="mr-2" /> Cancel Invoice
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save size={16} className="mr-2" /> Save
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setInvoiceState(fetchInvoice.data);
                  setIsEditing(false);
                }}
              >
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-blue-100">Grand Total</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{grandTotal.toLocaleString("en-IN")}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-green-100">Amount Paid</p>
          {isEditing ? (
            <Input
              type="text"
              value={invoice.amountPaid || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                const numValue = parseNum(value);

                if (numValue > grandTotal) {
                  toast.error("Amount paid cannot exceed grand total");
                  setInvoiceState({
                    ...invoice,
                    amountPaid: grandTotal,
                  });
                } else {
                  setInvoiceState({
                    ...invoice,
                    amountPaid: value,
                  });
                }
              }}
              className="w-full mt-2 text-black font-bold px-3 py-2 rounded"
            />
          ) : (
            <h1 className="text-3xl font-bold mt-1">
              ₹{parseNum(invoice.amountPaid).toLocaleString("en-IN")}
            </h1>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-orange-100">Balance Due</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{balanceDue.toLocaleString("en-IN")}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-purple-100">Total Items</p>
          <h1 className="text-3xl font-bold mt-1">{totalItems}</h1>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          Invoice Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-slate-600 mb-2 font-medium">Invoice No</label>
            <input
              readOnly
              className="w-full border border-slate-300 bg-slate-50 px-3 py-2 rounded-md"
              value={invoice.invoiceNumber || ""}
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-2 font-medium">Date</label>
            <input
              type={isEditing ? "date" : "text"}
              value={
                isEditing
                  ? invoice.invoiceDate?.split("T")[0]
                  : invoiceDateFormatted
              }
              onChange={(e) =>
                setInvoiceState({ ...invoice, invoiceDate: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-2 font-medium">Type</label>
            <input
              className="w-full border border-slate-300 bg-slate-50 px-3 py-2 rounded-md capitalize"
              readOnly
              value={invoice.invoiceType}
            />
          </div>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <User className="text-blue-600" size={20} />
          Customer Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <label className="block text-slate-600 mb-2 font-medium">Name</label>
            <input
              readOnly={!isEditing}
              value={invoice.customer?.name || ""}
              onChange={(e) =>
                setInvoiceState({
                  ...invoice,
                  customer: { ...invoice.customer, name: e.target.value },
                })
              }
              className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-2 font-medium">Phone</label>
            <input
              readOnly={!isEditing}
              value={invoice.customer?.phone || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setInvoiceState({
                  ...invoice,
                  customer: { ...invoice.customer, phone: value },
                });
              }}
              maxLength={10}
              className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
        </div>
      </div>

      {/* VEHICLE DETAILS - Show if job-card */}
      {invoice.invoiceType === "job-card" && invoice.vehicle && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Package className="text-green-600" size={20} />
            Vehicle Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-slate-600 mb-2 font-medium text-sm">
                Registration Number
              </label>
              <input
                readOnly={!isEditing}
                value={invoice.vehicle?.registrationNumber || ""}
                onChange={(e) =>
                  setInvoiceState({
                    ...invoice,
                    vehicle: {
                      ...invoice.vehicle,
                      registrationNumber: e.target.value.toUpperCase(),
                    },
                  })
                }
                className={`w-full border border-slate-300 px-3 py-2 rounded-md uppercase ${
                  isEditing ? "bg-white" : "bg-slate-50"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-2 font-medium text-sm">
                Frame Number
              </label>
              <input
                readOnly={!isEditing}
                value={invoice.vehicle?.frameNumber || ""}
                onChange={(e) =>
                  setInvoiceState({
                    ...invoice,
                    vehicle: {
                      ...invoice.vehicle,
                      frameNumber: e.target.value.toUpperCase(),
                    },
                  })
                }
                className={`w-full border border-slate-300 px-3 py-2 rounded-md uppercase ${
                  isEditing ? "bg-white" : "bg-slate-50"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-2 font-medium text-sm">
                Bike Model
              </label>
              <input
                readOnly={!isEditing}
                value={invoice.vehicle?.model || ""}
                onChange={(e) =>
                  setInvoiceState({
                    ...invoice,
                    vehicle: {
                      ...invoice.vehicle,
                      model: e.target.value,
                    },
                  })
                }
                className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                  isEditing ? "bg-white" : "bg-slate-50"
                }`}
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-3">Next Service Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-2 font-medium text-sm">
                  Next Service KM
                </label>
                <input
                  readOnly={!isEditing}
                  type="text"
                  value={invoice.vehicle?.nextServiceKm || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setInvoiceState({
                      ...invoice,
                      vehicle: {
                        ...invoice.vehicle,
                        nextServiceKm: value,
                      },
                    });
                  }}
                  className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                    isEditing ? "bg-white" : "bg-slate-50"
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-2 font-medium text-sm">
                  Next Service Date
                </label>
                <input
                  readOnly={!isEditing}
                  type={isEditing ? "date" : "text"}
                  value={
                    isEditing
                      ? invoice.vehicle?.nextServiceDate?.split("T")[0] || ""
                      : invoice.vehicle?.nextServiceDate
                      ? new Date(invoice.vehicle.nextServiceDate).toLocaleDateString("en-IN")
                      : ""
                  }
                  onChange={(e) =>
                    setInvoiceState({
                      ...invoice,
                      vehicle: {
                        ...invoice.vehicle,
                        nextServiceDate: e.target.value,
                      },
                    })
                  }
                  className={`w-full border border-slate-300 px-3 py-2 rounded-md ${
                    isEditing ? "bg-white" : "bg-slate-50"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT SEARCH */}
      {isEditing && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold">Add Product</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search products by name or part number..."
              className="pl-10 mb-3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                Searching...
              </div>
            )}
          </div>

          {shouldSearch && !searchLoading && products.length > 0 && (
            <div className="border border-slate-300 rounded-lg max-h-60 overflow-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => addItemToInvoice(product)}
                >
                  <p className="font-semibold text-slate-800">{product.partName}</p>
                  <p className="text-sm text-slate-600">Part No: {product.partNo}</p>
                  <p className="text-sm text-blue-600 font-bold">
                    ₹{parseNum(product.revisedMRP).toLocaleString("en-IN")} | GST: {parseNum(product.CGSTCode) + parseNum(product.SGSTCode)}%
                  </p>
                </div>
              ))}
            </div>
          )}

          {shouldSearch && !searchLoading && products.length === 0 && (
            <div className="border border-slate-300 rounded-lg p-4 text-center text-slate-500">
              No products found for "{search}"
            </div>
          )}
        </div>
      )}

      {/* ITEMS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            Invoice Items ({totalItems})
          </h2>
        </div>

        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Part No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                {isEditing && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoice.items.map((item, i) => {
                const gstRate = parseNum(item.CGSTCode) + parseNum(item.SGSTCode);
                
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>{item.partNo}</TableCell>
                    <TableCell className="font-semibold">{item.partName}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.tariff || ""}
                          onChange={(e) =>
                            updateItemField(i, "tariff", e.target.value)
                          }
                          className="w-24"
                        />
                      ) : (
                        item.tariff || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(i, "quantity", value || "0");
                          }}
                          className="w-20"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.revisedMRP}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(i, "revisedMRP", value);
                          }}
                          className="w-24"
                        />
                      ) : (
                        `₹${parseNum(item.revisedMRP).toLocaleString("en-IN")}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.discount === 0 || item.discount === "0" ? "" : item.discount}
                          placeholder="0"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(i, "discount", value);
                          }}
                          className="w-24"
                        />
                      ) : (
                        parseNum(item.discount) > 0 ? `₹${parseNum(item.discount).toLocaleString("en-IN")}` : "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={gstRate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            const rate = parseNum(value);
                            updateItemField(i, "CGSTCode", rate / 2);
                            updateItemField(i, "SGSTCode", rate / 2);
                          }}
                          className="w-20"
                        />
                      ) : (
                        `${gstRate}%`
                      )}
                    </TableCell>
                    <TableCell className="text-orange-600 font-semibold">
                      ₹{parseNum(item.taxAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ₹{parseNum(item.finalAmount).toLocaleString("en-IN")}
                    </TableCell>

                    {isEditing && (
                      <TableCell>
                        <button
                          onClick={() => deleteItem(i)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* TOTALS SUMMARY */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-xl shadow-xl p-6 text-white mb-6">
        <h3 className="text-xl font-bold mb-4">Invoice Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <p className="text-slate-300 text-sm">Sub Total</p>
            <h1 className="text-xl font-bold mt-1">
              ₹{subTotal.toLocaleString("en-IN")}
            </h1>
          </div>

          {totalDiscount > 0 && (
            <div>
              <p className="text-slate-300 text-sm">Total Discount</p>
              <h1 className="text-xl font-bold text-green-400 mt-1">
                -₹{totalDiscount.toLocaleString("en-IN")}
              </h1>
            </div>
          )}

          <div>
            <p className="text-slate-300 text-sm">Total Tax</p>
            <h1 className="text-xl font-bold text-orange-400 mt-1">
              ₹{totalTax.toLocaleString("en-IN")}
            </h1>
          </div>

          <div>
            <p className="text-slate-300 text-sm">Round Off</p>
            <h1 className="text-xl font-bold mt-1">
              ₹{roundOff.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h1>
          </div>

          <div>
            <p className="text-slate-300 text-sm">Amount Paid</p>
            <h1 className="text-xl font-bold text-green-300 mt-1">
              ₹{parseNum(invoice.amountPaid).toLocaleString("en-IN")}
            </h1>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center">
          <div>
            <p className="text-slate-300 text-sm">Balance Due</p>
            <h1 className="text-2xl font-bold text-yellow-400 mt-1">
              ₹{balanceDue.toLocaleString("en-IN")}
            </h1>
          </div>
          
          <div className="text-right">
            <p className="text-slate-300 text-sm">Grand Total</p>
            <h1 className="text-3xl font-bold text-emerald-400 mt-1">
              ₹{grandTotal.toLocaleString("en-IN")}
            </h1>
          </div>
        </div>
      </div>

      {/* PAYMENT TYPE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Payment Type</h3>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (isEditing) {
                setInvoiceState({ ...invoice, amountType: "cash" });
              }
            }}
            disabled={!isEditing}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              invoice.amountType === "cash"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700"
            } ${isEditing ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-75"}`}
          >
            Cash
          </button>
          <button
            onClick={() => {
              if (isEditing) {
                setInvoiceState({ ...invoice, amountType: "credit" });
              }
            }}
            disabled={!isEditing}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              invoice.amountType === "credit"
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700"
            } ${isEditing ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-75"}`}
          >
            Credit
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={32} />
              <h3 className="font-bold text-xl">Confirm Delete</h3>
            </div>
            <p className="text-slate-700 mb-2">
              Are you sure you want to delete this invoice?
            </p>
            <p className="text-slate-600 text-sm mb-6">
              Invoice: <span className="font-semibold">{invoice.invoiceNumber}</span>
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                onClick={handleDelete}
              >
                Delete Invoice
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceId;