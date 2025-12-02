import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  setSelectedPurchase,
  updatePurchaseState,
} from "@/store/purchases/purchaseSlice";

import { usePurchaseById, useUpdatePurchase } from "@/features/purchase/usePurchase";

import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

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

  // Backup for cancel
  const [origName, setOrigName] = useState("");
  const [origRows, setOrigRows] = useState([]);

  const [editing, setEditing] = useState(false);

  /** Load purchase into Redux & state */
  useEffect(() => {
    if (purchase) {
      dispatch(setSelectedPurchase(purchase)); // 🔥 Redux state

      const formatted = purchase.items.map((it) => ({
        ...it,
        total: it.quantity * it.price,
      }));

      setOrderName(purchase.orderName);
      setRows(formatted);

      setOrigName(purchase.orderName);
      setOrigRows(formatted);
    }
  }, [purchase, dispatch]);

  const handleEdit = (i, field, value) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[i][field] = value;

      const qty = Number(copy[i].quantity) || 0;
      const price = Number(copy[i].price) || 0;
      copy[i].total = qty * price;

      return copy;
    });
  };

  /** SAVE with optimistic UI */
  const handleSave = () => {
    // Instant UI update
    dispatch(
      updatePurchaseState({
        id: purchaseId,
        data: {
          orderName,
          items: rows,
        },
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
        },
        onError: () => {
          toast.error("Failed, Reverting back...");
          setOrderName(origName);
          setRows(origRows);
        },
      }
    );
  };

  /** Cancel */
  const handleCancel = () => {
    setOrderName(origName);
    setRows(origRows);
    setEditing(false);
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
                <Button disabled={saving} onClick={handleSave}>
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
              onChange={(e) => setOrderName(e.target.value)}
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
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((col) => (
                    <th key={col.key} className="p-2 text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="p-2 text-center">
                        <input
                          value={row[col.key]}
                          disabled={!editing || col.key === "total"}
                          onChange={(e) => handleEdit(i, col.key, e.target.value)}
                          className={`w-full px-2 py-1 border rounded ${
                            col.key === "total" ? "bg-gray-100 font-semibold" : ""
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseId;
