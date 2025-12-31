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
  <thead className="[&_tr]:border-b bg-linear-to-r from-blue-500 to-indigo-600" {...props}>
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

// Get rate excluding GST (same as InvoiceGenerator)
const getRate = (item) => {
  const mrp = Number(item.MRP) || 0;
  const gst = Number(item.gst) || 0;

  if (!gst) return mrp;
  return mrp / (1 + gst / 100);
};

// Calculate final amount for an item (MRP * Quantity)
const itemFinalAmount = (item) => {
  const mrp = Number(item.MRP) || 0;
  const qty = Number(item.quantity) || 0;
  return mrp * qty;
};

// Convert product into invoice item (matching InvoiceGenerator structure)
const convertProductToItem = (product) => {
  return {
    partNo: product.partNo || "",
    partName: product.partName || "",
    largeGroup: product.largeGroup || "",
    tariff: product.tariff || "",
    MRP: product.revisedMRP,
    quantity: 1,
    gst: product.IGSTCode,
    rate: Number((product.revisedMRP / (1 + product.IGSTCode / 100)).toFixed(2)),
  };
};

// Calculate totals from items (matching InvoiceGenerator)
const calculateTotalsFromItems = (items = []) => {
  return items.reduce((sum, item) => {
    return sum + itemFinalAmount(item);
  }, 0);
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

  // Calculate totals
  const totalAmount = invoiceState ? calculateTotalsFromItems(invoiceState.items) : 0;
  const amountPaid = invoiceState ? parseNum(invoiceState.amountPaid) : 0;
  const balanceDue = Math.max(totalAmount - amountPaid, 0);
  const totalItems = invoiceState ? invoiceState.items.length : 0;

  // useEffect to auto-correct amount paid when it exceeds total or is negative
  useEffect(() => {
    if (!invoiceState || !isEditing) return;

    const paid = parseNum(invoiceState.amountPaid);

    if (paid > totalAmount) {
      setInvoiceState(prev => ({
        ...prev,
        amountPaid: String(totalAmount)
      }));
      toast.info("Amount paid adjusted to total amount");
    }

    if (paid < 0) {
      setInvoiceState(prev => ({
        ...prev,
        amountPaid: "0"
      }));
      toast.info("Amount paid cannot be negative");
    }
  }, [invoiceState?.amountPaid, totalAmount, isEditing]);

  if (isLoading || !invoiceState)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const invoice = invoiceState;

  // Auto status preview
  const previewStatus = balanceDue <= 0 ? "completed" : "pending";

  // Check for duplicate product
  const isDuplicateProduct = (productId) => {
    return invoice.items.some((item) => item._id === productId);
  };

  // Add product to invoice
  const addItemToInvoice = (product) => {
    if (isDuplicateProduct(product._id)) {
      toast.error("Product Already Added!");
      return;
    }

    const newItem = convertProductToItem(product);

    setInvoiceState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSearch("");
    toast.success("Product Added");
  };

  // Update item field
  const updateItemField = (index, field, value) => {
    const updated = [...invoice.items];

    if (field === "quantity") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else if (field === "gst" || field === "MRP") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }

    // Recalculate rate when gst or MRP changes
    if (field === "gst" || field === "MRP") {
      updated[index].rate = Number(getRate(updated[index]).toFixed(2));
    }

    setInvoiceState({ ...invoice, items: updated });
  };

  const deleteItem = (index) => {
    const updated = invoice.items.filter((_, i) => i !== index);
    setInvoiceState({ ...invoice, items: updated });
    toast.info("Item Removed");
  };

  const handleSave = async () => {
    // Validate customer details
    if (!invoice.customer?.name || !invoice.customer?.phone) {
      toast.error("Missing Customer Details", {
        description: "Please enter customer name and phone number.",
      });
      return;
    }

    if (String(invoice.customer.phone).length !== 10) {
      toast.error("Invalid Phone Number", {
        description: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    if (invoice.items.length === 0) {
      toast.error("No Products Added", {
        description: "Please add at least one product.",
      });
      return;
    }

    try {
      // Prepare items with proper number conversion
      const itemsToSave = invoice.items.map((item) => ({
        partNo: item.partNo || "",
        partName: item.partName || "",
        largeGroup: item.largeGroup || "",
        tariff: item.tariff || "",
        MRP: Number(item.MRP) || 0,
        quantity: Number(item.quantity) || 1,
        gst: Number(item.gst) || 0,
        rate: Number(getRate(item).toFixed(2)),
      }));

      // Recalculate totals
      const calculatedTotal = calculateTotalsFromItems(itemsToSave);
      const paid = parseNum(invoice.amountPaid);
      const balance = Math.max(calculatedTotal - paid, 0);

      const payload = {
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
        invoiceType: invoice.invoiceType,
        
        customer: {
          name: invoice.customer.name.trim(),
          phone: invoice.customer.phone.trim(),
        },

        vehicle: invoice.invoiceType === "job-card" ? {
          registrationNumber: invoice.vehicle?.registrationNumber || null,
          frameNumber: invoice.vehicle?.frameNumber || null,
          model: invoice.vehicle?.model || null,
          nextServiceKm: invoice.vehicle?.nextServiceKm ? Number(invoice.vehicle.nextServiceKm) : null,
          nextServiceDate: invoice.vehicle?.nextServiceDate ? new Date(invoice.vehicle.nextServiceDate) : null,
        } : undefined,

        items: itemsToSave,
        
        totalAmount: calculatedTotal,
        amountPaid: paid,
        balanceDue: balance,
        
        amountType: invoice.amountType,
        
        invoiceStatus: balance === 0 ? "completed" : "pending",
      };

      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: payload,
      });

      toast.success("Invoice Updated Successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to Update Invoice", {
        description: error.response?.data?.message || "Something went wrong.",
      });
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
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
    };
    return map[status] || map.pending;
  };

  const invoiceDateFormatted = new Date(invoice.invoiceDate).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit size={16} className="mr-2" /> Edit
              </Button>

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
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-blue-100">Total Amount</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{totalAmount.toLocaleString("en-IN")}
          </h1>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-green-100">Amount Paid</p>
          {isEditing ? (
            <Input
              type="text"
              value={invoice.amountPaid || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                setInvoiceState({
                  ...invoice,
                  amountPaid: value,
                });
              }}
              onBlur={() => {
                const paid = Number(invoice.amountPaid);
                if (!invoice.amountPaid || isNaN(paid)) {
                  setInvoiceState({ ...invoice, amountPaid: "0" });
                  return;
                }
                if (paid > totalAmount) {
                  setInvoiceState({ ...invoice, amountPaid: String(totalAmount) });
                  toast.info("Amount paid cannot exceed total. Adjusted to total.");
                }
                if (paid < 0) {
                  setInvoiceState({ ...invoice, amountPaid: "0" });
                }
              }}
              className="w-full mt-2 text-black font-bold px-3 py-2 rounded"
            />
          ) : (
            <h1 className="text-3xl font-bold mt-1">
              ₹{amountPaid.toLocaleString("en-IN")}
            </h1>
          )}
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-orange-100">Balance Due</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{balanceDue.toLocaleString("en-IN")}
          </h1>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
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
              className="w-full border border-slate-300 bg-slate-50 px-3 py-2 rounded-md font-mono"
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
              type="text"
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
              type="text"
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
      {invoice.invoiceType === "job-card" && (
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
                type="text"
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
                type="text"
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
                type="text"
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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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
                    ₹{parseNum(product.revisedMRP).toLocaleString("en-IN")} | GST: {parseNum(product.IGSTCode)}%
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
                <TableHead>Rate (excl. GST)</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>MRP</TableHead>
                {isEditing && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoice.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEditing ? 10 : 9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-16 h-16 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No items added yet</p>
                      <p className="text-sm">Search and add products to the invoice</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoice.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell className="text-slate-600">{item.partNo}</TableCell>
                    <TableCell className="font-semibold">{item.partName}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.tariff || ""}
                          onChange={(e) =>
                            updateItemField(i, "tariff", e.target.value)
                          }
                          className="min-w-[90px]"
                          placeholder="HSN"
                        />
                      ) : (
                        item.tariff || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.quantity || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, "");
                            updateItemField(i, "quantity", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || Number(e.target.value) < 1) {
                              updateItemField(i, "quantity", 1);
                            }
                          }}
                          className="min-w-[70px]"
                          placeholder="1"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      ₹{getRate(item).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.gst || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(i, "gst", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) updateItemField(i, "gst", 0);
                          }}
                          className="min-w-20"
                          placeholder="0"
                        />
                      ) : (
                        `${item.gst}%`
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.MRP || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            updateItemField(i, "MRP", value);
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) updateItemField(i, "MRP", 0);
                          }}
                          className="min-w-20"
                          placeholder="0"
                        />
                      ) : (
                        `₹${parseNum(item.MRP).toLocaleString("en-IN")}`
                      )}
                    </TableCell>
                    

                    {isEditing && (
                      <TableCell>
                        <button
                          onClick={() => deleteItem(i)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAYMENT DETAILS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-linear-to-b from-green-500 to-emerald-600 rounded-full"></div>
          Payment Details
        </h3>
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
                ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg"
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
                ? "bg-linear-to-r from-orange-500 to-red-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700"
            } ${isEditing ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-75"}`}
          >
            Credit
          </button>
        </div>
      </div>

      {/* TOTAL SUMMARY */}
      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-6">Invoice Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-300 text-sm">Total Amount</p>
            <h1 className="text-3xl font-bold mt-1">
              ₹{totalAmount.toLocaleString("en-IN")}
            </h1>
          </div>

          <div>
            <p className="text-slate-300 text-sm">Amount Paid</p>
            <h1 className="text-3xl font-bold text-green-300 mt-1">
              ₹{amountPaid.toLocaleString("en-IN")}
            </h1>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-700">
            <p className="text-slate-300 text-sm">Balance Due</p>
            <h1 className="text-3xl font-bold text-yellow-400 mt-1">
              ₹{balanceDue.toLocaleString("en-IN")}
            </h1>
          </div>
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