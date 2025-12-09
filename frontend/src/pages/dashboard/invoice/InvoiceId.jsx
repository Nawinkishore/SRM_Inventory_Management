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
} from "lucide-react";
import { toast } from "sonner";

// UI Wrappers (no changes)
const Table = ({ children, ...props }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b" {...props}>
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
    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
    {...props}
  >
    {children}
  </th>
);

const TableRow = ({ children, ...props }) => (
  <tr className="border-b transition-colors hover:bg-muted/50" {...props}>
    {children}
  </tr>
);

const TableCell = ({ children, ...props }) => (
  <td className="p-4 align-middle" {...props}>
    {children}
  </td>
);

// Convert product into invoice item
const convertProductToItem = (product) => {
  const price = Number(product.revisedMRP) || 0;
  const qty = 1;

  const gstPercent =
    product.IGSTCode > 0
      ? product.IGSTCode
      : (Number(product.CGSTCode) || 0) + (Number(product.SGSTCode) || 0);

  const itemSubtotal = qty * price;
  const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
  const finalAmount = itemSubtotal + taxAmount;

  return {
    partNo: product.partNo,
    partName: product.partName,
    largeGroup: product.largeGroup,
    tariff: product.tariff,
    revisedMRP: price,
    CGSTCode: product.CGSTCode,
    SGSTCode: product.SGSTCode,
    IGSTCode: product.IGSTCode,
    quantity: qty,
    discount: 0,
    taxAmount,
    finalAmount,
  };
};

// Local UI calculation only (backend always recalculates)
const calculateTotalsFromItems = (items = [], amountPaid = 0) => {
  let subTotal = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.revisedMRP) || 0;
    const itemSubtotal = qty * price;

    const gstPercent =
      item.IGSTCode > 0
        ? item.IGSTCode
        : (Number(item.CGSTCode) || 0) + (Number(item.SGSTCode) || 0);

    const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);

    subTotal += itemSubtotal;
    totalTax += taxAmount;
  });

  const grandTotal = subTotal + totalTax;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  return { subTotal, totalTax, grandTotal, balanceDue };
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
  const { data: products = [] } = useProductSearch(search);

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
  const { subTotal, totalTax, grandTotal, balanceDue } =
    calculateTotalsFromItems(invoice.items, invoice.amountPaid);

  const totalItems = invoice.items.length;

  // auto status preview
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

  const updateItemQty = (index, qty) => {
    if (qty < 1) qty = 1;

    setInvoiceState((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== index) return item;

        const itemSubtotal = qty * item.revisedMRP;
        const gstPercent =
          item.IGSTCode > 0
            ? item.IGSTCode
            : (Number(item.CGSTCode) || 0) + (Number(item.SGSTCode) || 0);

        const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
        const finalAmount = itemSubtotal + taxAmount;

        return { ...item, quantity: qty, taxAmount, finalAmount };
      });

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
      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: {
          invoiceDate: invoice.invoiceDate,
          remarks: invoice.remarks,
          customer: invoice.customer,
          items: invoice.items,
          amountPaid: invoice.amountPaid,
          invoiceStatus: previewStatus, // backend ignores if canceled
        },
      });

      toast.success("Invoice updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save invoice");
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
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-2">
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
      <div className="flex justify-between mb-6">
        <Link to="/dashboard/invoices">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </Link>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              {invoice.invoiceStatus !== "canceled" && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600"
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
              <Button onClick={handleSave} className="bg-green-600">
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
        {/* GRAND */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p>Grand Total</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{grandTotal.toLocaleString()}
          </h1>
        </div>

        {/* PAID Manual */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <p>Amount Paid</p>
          {isEditing ? (
            <Input
              type="number"
              min={0}
              value={invoice.amountPaid || ""}
              onChange={(e) => {
                let value = Number(e.target.value);

                if (value < 0) value = 0;
                if (value > grandTotal) value = grandTotal;

                setInvoiceState({
                  ...invoice,
                  amountPaid: value,
                });
              }}
              ssName="w-32 mt-2 text-black font-bold px-2 py-1 rounded"
            />
          ) : (
            <h1 className="text-3xl font-bold mt-1">
              ₹{(invoice.amountPaid || 0).toLocaleString()}
            </h1>
          )}
        </div>

        {/* BALANCE */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <p>Balance Due</p>
          <h1 className="text-3xl font-bold mt-1">
            ₹{balanceDue.toLocaleString()}
          </h1>
        </div>

        {/* COUNT */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <p>Total Items</p>
          <h1 className="text-3xl font-bold mt-1">{totalItems}</h1>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">Invoice Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label>Invoice No</label>
            <input
              readOnly
              className="w-full border bg-slate-50 px-3 py-2"
              value={invoice.invoiceNumber || ""}
            />
          </div>
          <div>
            <label>Date</label>
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
              className={`w-full border px-3 py-2 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
          <div>
            <label>Type</label>
            <input
              className="w-full border bg-slate-50 px-3 py-2 capitalize"
              readOnly
              value={invoice.invoiceType}
            />
          </div>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">Customer Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <label>Name</label>
            <input
              readOnly={!isEditing}
              value={invoice.customer?.name || ""}
              onChange={(e) =>
                setInvoiceState({
                  ...invoice,
                  customer: { ...invoice.customer, name: e.target.value },
                })
              }
              className={`w-full border px-3 py-2 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              readOnly={!isEditing}
              value={invoice.customer?.phone || ""}
              onChange={(e) =>
                setInvoiceState({
                  ...invoice,
                  customer: { ...invoice.customer, phone: e.target.value },
                })
              }
              className={`w-full border px-3 py-2 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
        </div>
      </div>

      {/* PRODUCT SEARCH */}
      {isEditing && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold">Add Product</h2>
          </div>

          <Input
            placeholder="Search products..."
            className="mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && products.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="p-3 border-b cursor-pointer hover:bg-slate-100"
                  onClick={() => addItemToInvoice(product)}
                >
                  <p className="font-semibold">{product.partName}</p>
                  <p className="text-sm text-slate-600">{product.partNo}</p>
                  <p className="text-sm text-blue-600 font-bold">
                    ₹{product.revisedMRP}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ITEMS TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Invoice Items</h2>
        </div>

        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HSN/SAC</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Final Amount</TableHead>
                {isEditing && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoice.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.partNo}</TableCell>
                  <TableCell>{item.partName}</TableCell>
                  <TableCell>{item.tariff || "-"}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemQty(i, Number(e.target.value))
                        }
                        className="w-20"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>₹{item.revisedMRP}</TableCell>
                  <TableCell>₹{item.taxAmount}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    ₹{item.finalAmount.toLocaleString()}
                  </TableCell>

                  {isEditing && (
                    <TableCell>
                      <button
                        onClick={() => deleteItem(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAYMENT PANEL */}
      <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p>Sub Total</p>
            <h1 className="text-xl font-bold mt-1">
              ₹{subTotal.toLocaleString()}
            </h1>
          </div>

          <div>
            <p>Total Tax</p>
            <h1 className="text-xl font-bold mt-1">
              ₹{totalTax.toLocaleString()}
            </h1>
          </div>

          <div>
            <p>Amount Paid</p>
            <h1 className="text-xl font-bold text-green-300 mt-1">
              ₹{invoice.amountPaid.toLocaleString()}
            </h1>
          </div>

          <div>
            <p>Grand Total</p>
            <h1 className="text-2xl font-bold text-emerald-400 mt-1">
              ₹{grandTotal.toLocaleString()}
            </h1>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={32} />
              <h3 className="font-bold text-xl">Confirm Delete</h3>
            </div>
            <p>Are you sure? This cannot be undone.</p>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-red-600" onClick={handleDelete}>
                Delete
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
