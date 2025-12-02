import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  setSelectedPurchase,
  updatePurchaseState,
} from "@/store/purchases/purchaseSlice";

import {
  usePurchaseById,
  useUpdatePurchase
} from "@/features/purchase/usePurchase";

import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Plus, Trash } from "lucide-react";
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

const columns = [
  { key: "itemNumber", label: "Item Number" },
  { key: "quantity", label: "Qty" },
  { key: "price", label: "Price" },
  { key: "total", label: "Total" },
];

const PurchaseId = () => {
  const dispatch = useDispatch();
  const { purchaseId } = useParams();

  const selected = useSelector((state) => state.purchase.selectedPurchase);

  const { data: purchase, isLoading } = usePurchaseById(purchaseId);
  const { mutate: updatePurchase, isLoading: saving } =
    useUpdatePurchase(purchaseId);

  // Local editable states
  const [orderName, setOrderName] = useState("");
  const [rows, setRows] = useState([]);

  // Backup originals
  const [origName, setOrigName] = useState("");
  const [origRows, setOrigRows] = useState([]);

  const [editing, setEditing] = useState(false);

  // Track if user modified anything
  const [isEdited, setIsEdited] = useState(false);

  /** Load purchase into Redux & state */
  useEffect(() => {
    if (purchase) {
      dispatch(setSelectedPurchase(purchase));

      const formatted = purchase.items.map((it) => ({
        ...it,
        total: it.quantity * it.price,
      }));

      setOrderName(purchase.orderName);
      setRows(formatted);

      setOrigName(purchase.orderName);
      setOrigRows(formatted);
      setIsEdited(false);
    }
  }, [purchase, dispatch]);

  /** Detect Changes */
  const checkIfEdited = (newName, newRows) => {
    if (newName !== origName) return true;

    if (JSON.stringify(newRows) !== JSON.stringify(origRows)) return true;

    return false;
  };

  /** Row Editing */
  const handleEdit = (i, field, value) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[i][field] = value;

      const qty = Number(copy[i].quantity) || 0;
      const price = Number(copy[i].price) || 0;
      copy[i].total = qty * price;

      setIsEdited(checkIfEdited(orderName, copy));
      return copy;
    });
  };

  /** Remove Row */
  const removeRow = (index) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;

    setRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // Keep at least 1 empty row
      if (updated.length === 0) {
        updated.push({ itemNumber: "", quantity: "", price: "", total: "" });
      }

      setIsEdited(checkIfEdited(orderName, updated));
      return updated;
    });
  };

  /** Name Editing */
  const handleNameChange = (value) => {
    setOrderName(value);
    setIsEdited(checkIfEdited(value, rows));
  };

  /** Add Row */
  const addRow = () => {
    const newRows = [...rows, { itemNumber: "", quantity: "", price: "", total: "" }];
    setRows(newRows);
    setIsEdited(true);
  };

  /** SAVE */
  const handleSave = () => {
    if (!isEdited) return;

    dispatch(
      updatePurchaseState({
        id: purchaseId,
        data: { orderName, items: rows },
      })
    );

    updatePurchase(
      { orderName, items: rows },
      {
        onSuccess: () => {
          toast.success("Updated Successfully");
          setOrigName(orderName);
          setOrigRows(rows);
          setEditing(false);
          setIsEdited(false);
        },
        onError: () => {
          toast.error("Failed, reverting back...");
          setOrderName(origName);
          setRows(origRows);
          setIsEdited(false);
        },
      }
    );
  };

  /** Cancel */
  const handleCancel = () => {
    setOrderName(origName);
    setRows(origRows);
    setEditing(false);
    setIsEdited(false);
  };

  const createdAt =
    purchase?.createdAt &&
    new Date(purchase.createdAt).toISOString().slice(0, 10);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-xl mb-2 font-semibold">Purchase Details</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : !purchase ? (
        <p>Purchase not found.</p>
      ) : (
        <>
          {/* TOP BAR */}
          <div className="flex justify-between mb-6">
            <Link to="/dashboard/purchase">
              <Button variant="outline">← Back</Button>
            </Link>

            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Pencil size={16} className="mr-2" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  disabled={!isEdited || saving}
                  onClick={handleSave}
                  className={
                    isEdited
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                >
                  <Check size={16} className="mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>

                <Button variant="outline" onClick={handleCancel}>
                  <X size={16} className="mr-2" /> Cancel
                </Button>
              </div>
            )}
          </div>

          {/* INPUTS */}
          <div className="flex gap-3 mb-4">
            <input
              value={orderName}
              disabled={!editing}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`border rounded-md px-3 py-2 text-sm ${
                editing ? "" : "bg-gray-100"
              }`}
            />

            <input
              value={createdAt || ""}
              readOnly
              className="border rounded-md px-3 py-2 text-sm bg-gray-100"
            />
          </div>

          {/* ITEMS TABLE */}
          <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
            <Table className="w-full text-sm min-w-[700px]">
              <TableCaption className="text-gray-500">
                Stock item list
              </TableCaption>

              <TableHeader>
                <TableRow className="bg-gray-100">
                  {columns.map((col) => (
                    <TableHead key={col.key} className="p-2 text-center">
                      {col.label}
                    </TableHead>
                  ))}
                  {editing && (
                    <TableHead className="p-2 text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="p-2 text-center">
                        <input
                          value={row[col.key]}
                          disabled={!editing || col.key === "total"}
                          onChange={(e) =>
                            handleEdit(i, col.key, e.target.value)
                          }
                          className={`w-full px-2 py-1 border rounded ${
                            col.key === "total"
                              ? "bg-gray-100 font-semibold"
                              : ""
                          }`}
                        />
                      </TableCell>
                    ))}

                    {/* DELETE ROW */}
                    {editing && (
                      <TableCell className="text-center">
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
                ))}
              </TableBody>
            </Table>

            {/* ADD ROW - only in edit mode */}
            {editing && (
              <div className="mt-4">
                <Button
                  onClick={addRow}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} /> Add Row
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseId;
