import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import {
  usePurchaseById,
  useUpdatePurchase,
} from "@/features/purchase/usePurchase";

import { Button } from "@/components/ui/button";
import {
  Pencil,
  Check,
  X,
  Plus,
  Trash,
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

// base empty row used as placeholder
const EMPTY_ROW = { itemNumber: "", quantity: "", price: "", total: "" };

// Table columns
const columns = [
  { key: "itemNumber", label: "Item Number" },
  { key: "quantity", label: "Qty" },
  { key: "price", label: "Price" },
  { key: "total", label: "Total" },
];

// normalize rows for saving / comparison
const normalizeRows = (rows) =>
  (rows || [])
    .filter((r) => {
      const hasItem = r.itemNumber?.trim();
      const hasQty = Number(r.quantity) || 0;
      const hasPrice = Number(r.price) || 0;
      return hasItem || hasQty || hasPrice;
    })
    .map((r) => ({
      itemNumber: r.itemNumber?.trim() || "",
      quantity: Number(r.quantity) || 0,
      price: Number(r.price) || 0,
      total: Number(r.total) || 0,
    }));

const PurchaseId = () => {
  const { purchaseId } = useParams();

  // Fetch purchase
  const { data: purchase, isLoading } = usePurchaseById(purchaseId);

  // Update mutation
  const { mutate: updatePurchase, isLoading: saving } =
    useUpdatePurchase(purchaseId);

  const [orderName, setOrderName] = useState("");
  const [rows, setRows] = useState([EMPTY_ROW]);

  // original values store
  const [origName, setOrigName] = useState("");
  const [origRows, setOrigRows] = useState([EMPTY_ROW]);

  // edit flags
  const [editing, setEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  /** Load initial purchase */
  useEffect(() => {
    if (purchase) {
      const formatted =
        purchase.items && purchase.items.length > 0
          ? purchase.items.map((r) => ({
              ...r,
              quantity: Number(r.quantity) || 0,
              price: Number(r.price) || 0,
              total: (Number(r.quantity) || 0) * (Number(r.price) || 0),
            }))
          : [EMPTY_ROW];

      setOrderName(purchase.orderName || "");
      setRows(formatted);
      setOrigName(purchase.orderName || "");
      setOrigRows(formatted);
      setIsEdited(false);
      setEditing(false);
    }
  }, [purchase]);

  /** Duplicate item detection */
  const getDuplicateItems = (list) => {
    const seen = new Set();
    const duplicates = new Set();

    list.forEach((r) => {
      const key = r.itemNumber?.trim();
      if (!key) return;
      if (seen.has(key)) duplicates.add(key);
      else seen.add(key);
    });

    return duplicates;
  };

  const duplicateItems = getDuplicateItems(rows);
  const hasDuplicates = duplicateItems.size > 0;

  /** Compare vs original */
  const checkIfEdited = (name, currentRows) => {
    if (name !== origName) return true;

    const cleanedCurrent = normalizeRows(currentRows);
    const cleanedOriginal = normalizeRows(origRows);

    if (cleanedCurrent.length !== cleanedOriginal.length) return true;
    if (JSON.stringify(cleanedCurrent) !== JSON.stringify(cleanedOriginal))
      return true;

    return false;
  };

  /** Row edit handler */
  const handleEdit = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      const qty = Number(updated[index].quantity) || 0;
      const price = Number(updated[index].price) || 0;
      updated[index].total = qty * price;

      setIsEdited(checkIfEdited(orderName, updated));
      return updated;
    });
  };

  /** Name edit */
  const handleNameChange = (value) => {
    setOrderName(value);
    setIsEdited(checkIfEdited(value, rows));
  };

  /** Add row */
  const addRow = () => {
    const updated = [...rows, { ...EMPTY_ROW }];
    setRows(updated);
    setIsEdited(true);
  };

  /** Remove row */
  const removeRow = (index) => {
    if (!window.confirm("Remove this row?")) return;

    let updated = rows.filter((_, i) => i !== index);

    if (updated.length === 0) updated = [{ ...EMPTY_ROW }];

    setRows(updated);
    setIsEdited(checkIfEdited(orderName, updated));
  };

  /** Save */
  const handleSave = () => {
    if (hasDuplicates) {
      toast.error("Duplicate item numbers found. Fix before saving.");
      return;
    }

    const cleanedItems = normalizeRows(rows);

    updatePurchase(
      { orderName, items: cleanedItems },
      {
        onSuccess: () => {
          toast.success("Updated Successfully");

          const nextRows =
            cleanedItems.length > 0 ? cleanedItems : [{ ...EMPTY_ROW }];

          setOrigName(orderName);
          setOrigRows(nextRows);
          setRows(nextRows);
          setIsEdited(false);
          setEditing(false);
        },
        onError: () => {
          toast.error("Failed, reverting");
          setOrderName(origName);
          setRows(origRows);
          setIsEdited(false);
          setEditing(false);
        },
      }
    );
  };

  /** Cancel */
  const handleCancel = () => {
    setOrderName(origName);
    setRows(origRows);
    setIsEdited(false);
    setEditing(false);
  };

  const createdAt =
    purchase?.createdAt &&
    new Date(purchase.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const nonEmptyRows = normalizeRows(rows);
  const grandTotal = nonEmptyRows.reduce(
    (sum, r) => sum + (Number(r.total) || 0),
    0
  );
  const totalItems = nonEmptyRows.length;
  const totalQuantity = nonEmptyRows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0),
    0
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Package className="text-blue-600" size={28} />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Purchase Details
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          View and edit purchase order information
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !purchase ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg">Purchase not found.</p>
        </div>
      ) : (
        <>
          {/* Back + Edit Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link to="/dashboard/purchase">
              <Button
                variant="outline"
                className="border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to List
              </Button>
            </Link>

            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Pencil size={16} className="mr-2" /> Edit Purchase
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  disabled={!isEdited || saving || hasDuplicates}
                  onClick={handleSave}
                  className={
                    hasDuplicates
                      ? "bg-red-400 cursor-not-allowed text-white"
                      : isEdited
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                      : "bg-slate-300 cursor-not-allowed text-slate-500"
                  }
                >
                  <Check size={16} className="mr-2" />{" "}
                  {saving ? "Saving..." : "Save"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X size={16} className="mr-2" /> Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Duplicate Warning */}
          {hasDuplicates && editing && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="font-semibold text-red-800">
                  Duplicate Item Numbers Detected
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Fix the duplicate item numbers before saving.
                </p>
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
              <p className="text-blue-100 text-sm">Total Items</p>
              <p className="text-3xl font-bold mt-1">{totalItems}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <p className="text-purple-100 text-sm">Total Quantity</p>
              <p className="text-3xl font-bold mt-1">{totalQuantity}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
              <p className="text-emerald-100 text-sm">Grand Total</p>
              <p className="text-3xl font-bold mt-1">
                ₹{grandTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* ORDER INFO */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-200">
            <h2 className="text-lg font-bold mb-4">Order Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Order Name
                </label>
                <input
                  value={orderName}
                  disabled={!editing}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full border-2 rounded-lg px-4 py-3 text-sm ${
                    editing
                      ? "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Created Date
                </label>
                <input
                  value={createdAt || ""}
                  readOnly
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <div className="p-5 border-b bg-slate-50">
              <h2 className="text-lg font-bold">Purchase Items</h2>
            </div>

            <div className="p-4 overflow-x-auto">
              <Table className="min-w-[700px] text-sm">
                <TableCaption className="text-slate-500 pb-4">
                  Stock item list
                </TableCaption>

                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                    {columns.map((c) => (
                      <TableHead key={c.key} className="text-center p-3">
                        {c.label}
                      </TableHead>
                    ))}
                    {editing && (
                      <TableHead className="p-3 text-center">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row, i) => {
                    const isDuplicateRow =
                      row.itemNumber?.trim() &&
                      duplicateItems.has(row.itemNumber.trim());

                    return (
                      <TableRow
                        key={i}
                        className={`border-b ${
                          isDuplicateRow
                            ? "bg-red-50"
                            : i % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50"
                        }`}
                      >
                        {columns.map((c) => (
                          <TableCell key={c.key} className="p-3 text-center">
                            <input
                              value={row[c.key]}
                              disabled={!editing || c.key === "total"}
                              onChange={(e) =>
                                handleEdit(i, c.key, e.target.value)
                              }
                              className={`w-full px-3 py-2 border-2 rounded-lg text-center ${
                                c.key === "total"
                                  ? "bg-blue-50 border-blue-200 font-bold text-blue-700"
                                  : isDuplicateRow && c.key === "itemNumber"
                                  ? "border-red-500 bg-red-50"
                                  : editing
                                  ? "border-slate-300 focus:border-blue-500"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            />
                          </TableCell>
                        ))}

                        {editing && (
                          <TableCell className="p-3 text-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeRow(i)}
                            >
                              <Trash size={16} />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* ADD ROW */}
              {editing && (
                <div className="mt-6">
                  <Button onClick={addRow}>
                    <Plus size={16} /> Add New Item
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER SUMMARY */}
          <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 text-white">
            <div className="flex justify-between">
              <div>
                <p className="text-slate-300 text-sm mb-1">Order Summary</p>
                <p className="text-2xl font-bold">{orderName}</p>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-1">Grand Total</p>
                <p className="text-3xl font-bold text-emerald-400">
                  ₹{grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseId;
