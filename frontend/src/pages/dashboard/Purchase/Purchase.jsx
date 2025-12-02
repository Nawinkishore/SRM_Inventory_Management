import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Search, Trash } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import {
  setPurchases,
  removePurchaseState,
} from "@/store/purchases/purchaseSlice";

import {
  usePurchaseList,
  useDeletePurchase,
} from "@/features/purchase/usePurchase";
import { toast } from "sonner";

const Purchase = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const purchasesState = useSelector((state) => state.purchase.purchases);

  const { data: purchases = [], isLoading } = usePurchaseList(user?._id);

  const { mutate: deletePurchase, isLoading: deleteLoading } =
    useDeletePurchase(user?._id);

  // Sync React Query → Redux
  // Sync React Query -> Redux without infinite loop
  useEffect(() => {
    if (!purchases) return;

    // compare only changes
    if (purchases.length !== purchasesState.length) {
      dispatch(setPurchases(purchases));
    }
  }, [purchases, purchasesState.length, dispatch]);

  const [query, setQuery] = useState("");

  // Filter results
  const filteredPurchases = useMemo(() => {
    return purchasesState.filter((order) =>
      order.orderName.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, purchasesState]);

  // Delete Handler
  const handleDelete = useCallback(
    (purchaseId) => {
      if (!window.confirm("Are you sure you want to delete this order?"))
        return;

      // Remove from UI immediately
      dispatch(removePurchaseState(purchaseId));

      deletePurchase(purchaseId, {
        onSuccess: () => {
          toast.success("Purchase deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete purchase");
        },
      });
    },
    [deletePurchase, dispatch]
  );

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-gray-700">
          Stock Dashboard
        </h1>

        <Link to="/dashboard/purchase/stocks/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Add Purchase
          </Button>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-2">
        <Search size={18} className="text-gray-600" />
        <input
          type="text"
          placeholder="Search purchase by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-2 py-1 text-sm outline-none"
        />
      </div>

      {/* RECENT PURCHASES */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Recent Purchases
        </h2>

        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          {isLoading ? (
            <p className="text-gray-500 text-sm py-4">Loading...</p>
          ) : filteredPurchases.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No purchases found
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredPurchases.slice(0, 6).map((purchase) => (
                <Link
                  to={`/dashboard/purchase/${purchase._id}`}
                  key={purchase._id}
                  className="min-w-[220px] p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition cursor-pointer shadow-sm"
                >
                  <p className="font-semibold mb-1 text-gray-800 truncate">
                    {purchase.orderName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-gray-700 mt-1">
                    Total ₹{" "}
                    {purchase.items.reduce(
                      (sum, item) => sum + item.quantity * item.price,
                      0
                    )}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PURCHASE TABLE */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          All Purchase Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3">Order Name</th>
                <th className="py-2 px-3">Items</th>
                <th className="py-2 px-3">Total</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => {
                const totalPrice = purchase.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <tr key={purchase._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-800">
                      {purchase.orderName}
                    </td>

                    <td className="py-2 px-3 text-gray-600">
                      {purchase.items.length}
                    </td>

                    <td className="py-2 px-3 text-gray-600 font-semibold">
                      ₹ {totalPrice}
                    </td>

                    <td className="py-2 px-3 text-gray-500">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-2 px-3 flex gap-4 justify-center items-center">
                      <Link to={`/dashboard/purchase/${purchase._id}`}>
                        <Eye
                          size={20}
                          className="text-blue-600 hover:scale-110"
                        />
                      </Link>

                      <Trash
                        size={20}
                        className="text-red-600 cursor-pointer hover:scale-110"
                        onClick={() => handleDelete(purchase._id)}
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No purchase records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Purchase;
