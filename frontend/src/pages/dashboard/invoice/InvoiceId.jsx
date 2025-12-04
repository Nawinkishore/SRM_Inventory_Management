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
  CheckCircle,
  AlertCircle,
  FileText,
  IndianRupee,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

// Simple table components (shadcn-like)
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

// product -> invoice item (same GST logic as generator/backend)
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

// local helper to recompute totals on client (for display)
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
  const balanceDue = Math.max(0, grandTotal - (amountPaid || 0));

  return { subTotal, totalTax, grandTotal, balanceDue };
};

const InvoiceId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: fetchInvoice, isLoading, isError } = useInvoiceById(id);
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [search, setSearch] = useState("");
  const { data: products = [] } = useProductSearch(search);

  useEffect(() => {
    if (fetchInvoice?.data) {
      setEditedInvoice(fetchInvoice.data);
    }
  }, [fetchInvoice]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (isError) {
    toast.error("Failed to load invoice");
    return (
      <div className="text-center text-red-600 font-semibold py-16">
        Failed to load invoice
      </div>
    );
  }

  const invoice = fetchInvoice?.data;

  if (!invoice)
    return (
      <div className="text-center py-12 text-slate-600">Invoice not found</div>
    );

  const invoiceDate =
    invoice?.invoiceDate &&
    new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const activeItems = isEditing ? editedInvoice?.items || [] : invoice.items;
  const { subTotal, totalTax, grandTotal, balanceDue } =
    calculateTotalsFromItems(activeItems, invoice.amountPaid || 0);

  const totalItems = activeItems.length || 0;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: { invoiceStatus: newStatus },
      });
      toast.success(
        `Invoice ${
          newStatus === "completed" ? "completed" : "canceled"
        } successfully`
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editedInvoice,
        items: editedInvoice.items,
        amountPaid: invoice.amountPaid,
      };

      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: payload,
      });

      toast.success("Invoice updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update invoice");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice._id);
      toast.success("Invoice deleted successfully");
      navigate("/dashboard/invoices");
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > balanceDue) {
      toast.error("Payment amount cannot exceed balance due");
      return;
    }

    const newAmountPaid = (invoice.amountPaid || 0) + amount;

    try {
      await updateInvoice.mutateAsync({
        id: invoice._id,
        data: {
          amountPaid: newAmountPaid,
        },
      });

      setShowPaymentModal(false);
      setPaymentAmount("");
      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  // ITEMS MANAGEMENT
  const addItemToInvoice = (product) => {
    const newItem = convertProductToItem(product);

    setEditedInvoice((prev) => {
      const exists = prev.items.some((item) => item.partNo === newItem.partNo);
      if (exists) {
        toast.error("Item already exists in invoice");
        return prev;
      }
      toast.success("Item added to invoice");
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

    setSearch("");
  };

  const updateItemQty = (index, qty) => {
    const validQty = qty < 1 ? 1 : qty;

    setEditedInvoice((prev) => {
      const updatedItems = prev.items.map((item, i) => {
        if (i !== index) return item;

        const itemSubtotal = validQty * item.revisedMRP;

        const gstPercent =
          item.IGSTCode > 0
            ? item.IGSTCode
            : (Number(item.CGSTCode) || 0) + (Number(item.SGSTCode) || 0);

        const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
        const finalAmount = itemSubtotal + taxAmount;

        return {
          ...item,
          quantity: validQty,
          taxAmount,
          finalAmount,
        };
      });

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const deleteItem = (index) => {
    setEditedInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("Item removed from invoice");
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      canceled: "bg-red-100 text-red-800 border-red-300",
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="text-blue-600" size={28} />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Invoice Details
          </h1>
          <span
            className={`ml-auto px-4 py-2 rounded-lg border-2 font-semibold text-sm ${getStatusBadge(
              invoice.invoiceStatus
            )}`}
          >
            {invoice.invoiceStatus.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          View and manage invoice details
        </p>
      </div>

      {/* TOP ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link to="/dashboard/invoices">
          <Button
            variant="outline"
            className="border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </Link>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={invoice.invoiceStatus === "canceled"}
              >
                <Edit size={16} className="mr-2" /> Edit
              </Button>

              {/* {invoice.invoiceStatus === "draft" && (
                <Button
                  onClick={() => handleStatusChange("completed")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={16} className="mr-2" /> Mark Complete
                </Button>
              )} */}

              {invoice.invoiceStatus !== "canceled" && (
                <Button
                  onClick={() => handleStatusChange("canceled")}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X size={16} className="mr-2" /> Cancel Invoice
                </Button>
              )}

              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateInvoice.isPending}
              >
                <Save size={16} className="mr-2" />{" "}
                {updateInvoice.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedInvoice(invoice);
                  setSearch("");
                  toast.info("Edit cancelled");
                }}
                variant="outline"
              >
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-blue-100 text-sm font-medium">Grand Total</p>
          <p className="text-3xl font-bold mt-1">
            ₹{grandTotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-green-100 text-sm font-medium">Amount Paid</p>
          <p className="text-3xl font-bold mt-1">
            ₹{(invoice.amountPaid || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-orange-100 text-sm font-medium">Balance Due</p>
          <p className="text-3xl font-bold mt-1">
            ₹{balanceDue.toLocaleString()}
          </p>
          {balanceDue > 0 && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="mt-3 bg-white text-orange-600 hover:bg-orange-50 text-sm py-1 px-3"
              size="sm"
            >
              Record Payment
            </Button>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-purple-100 text-sm font-medium">Total Items</p>
          <p className="text-3xl font-bold mt-1">{totalItems}</p>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
          Invoice Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-2 mb-1">
              <Receipt size={16} className="text-blue-600" />
              Invoice No
            </label>
            <input
              value={invoice.invoiceNumber || ""}
              readOnly
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-2 text-slate-700"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-blue-600" />
              Invoice Date
            </label>
            <input
              type={isEditing ? "date" : "text"}
              value={
                isEditing
                  ? editedInvoice?.invoiceDate?.split("T")[0]
                  : invoiceDate || ""
              }
              onChange={(e) =>
                setEditedInvoice({
                  ...editedInvoice,
                  invoiceDate: e.target.value,
                })
              }
              readOnly={!isEditing}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-2 mb-1">
              <FileText size={16} className="text-blue-600" />
              Type
            </label>
            <input
              value={invoice.invoiceType || ""}
              readOnly
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-2 text-slate-700 capitalize"
            />
          </div>
        </div>

        {(invoice.remarks || isEditing) && (
          <div className="mt-4">
            <label className="font-semibold text-slate-700 mb-1 block">
              Remarks
            </label>
            <textarea
              value={isEditing ? editedInvoice?.remarks || "" : invoice.remarks}
              onChange={(e) =>
                setEditedInvoice({
                  ...editedInvoice,
                  remarks: e.target.value,
                })
              }
              readOnly={!isEditing}
              rows={2}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
        )}
      </div>

      {/* CUSTOMER INFO */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
          Customer Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <label className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Customer Name
            </label>
            <input
              value={
                isEditing
                  ? editedInvoice?.customer?.name || ""
                  : invoice.customer?.name || ""
              }
              onChange={(e) =>
                setEditedInvoice({
                  ...editedInvoice,
                  customer: {
                    ...editedInvoice.customer,
                    name: e.target.value,
                  },
                })
              }
              readOnly={!isEditing}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Package size={16} className="text-blue-600" />
              Mobile Number
            </label>
            <input
              value={
                isEditing
                  ? editedInvoice?.customer?.phone || ""
                  : invoice.customer?.phone || ""
              }
              onChange={(e) =>
                setEditedInvoice({
                  ...editedInvoice,
                  customer: {
                    ...editedInvoice.customer,
                    phone: e.target.value,
                  },
                })
              }
              readOnly={!isEditing}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 ${
                isEditing ? "bg-white" : "bg-slate-50"
              }`}
            />
          </div>
        </div>
      </div>

      {/* PRODUCT SEARCH IN EDIT MODE */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">
              Add Products
            </h2>
          </div>

          <div className="relative">
            <Input
              placeholder="Search products by name or part number..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />

            {search && products.length > 0 && (
              <div className="absolute w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto mt-2">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 cursor-pointer hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                    onClick={() => addItemToInvoice(p)}
                  >
                    <p className="font-medium text-slate-800">{p.partName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        {p.partNo}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{p.revisedMRP}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
            Invoice Items
          </h2>
        </div>

        <div className="overflow-x-auto p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold text-slate-700">
                  Part No
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Qty
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Price
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Tax
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Final Amount
                </TableHead>
                {isEditing && (
                  <TableHead className="font-bold text-slate-700">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {activeItems.map((item, i) => (
                <TableRow
                  key={i}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                >
                  <TableCell>{item.partNo}</TableCell>
                  <TableCell>{item.partName}</TableCell>
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
                  <TableCell className="font-bold text-emerald-600">
                    ₹{item.finalAmount.toLocaleString()}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAYMENT BREAKDOWN */}
      <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-300 text-sm mb-1">Sub Total</p>
            <p className="text-xl font-bold">
              ₹{subTotal.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-300 text-sm mb-1">Total Tax</p>
            <p className="text-xl font-bold">
              ₹{totalTax.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-300 text-sm mb-1">Amount Paid</p>
            <p className="text-xl font-bold text-green-400">
              ₹{(invoice.amountPaid || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-300 text-sm mb-1">Grand Total</p>
            <p className="text-2xl font-bold text-emerald-400">
              ₹{grandTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={32} />
              <h3 className="text-xl font-bold text-slate-800">
                Confirm Delete
              </h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleteInvoice.isPending}
              >
                {deleteInvoice.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <IndianRupee className="text-green-600" size={32} />
              <h3 className="text-xl font-bold text-slate-800">
                Record Payment
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Balance Due:{" "}
                <span className="font-bold text-lg">
                  ₹{balanceDue.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-lg"
                step="0.01"
                min="0"
                max={balanceDue}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePayment}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!paymentAmount || updateInvoice.isPending}
              >
                {updateInvoice.isPending ? "Processing..." : "Record Payment"}
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount("");
                }}
                variant="outline"
                className="flex-1"
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
