import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Search, Trash } from "lucide-react";
import { useSelector } from "react-redux";

// Example hook (replace with your hook)
import { usePurchaseList } from "@/features/purchase/usePurchase";

const Purchase = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: purchases = [], isLoading: loading } = usePurchaseList(user?._id);


  const [query, setQuery] = useState("");

  // Filter results
  const filteredPurchases = useMemo(() => {
    return purchases?.filter((order) =>
      order.orderName.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, purchases]);

  const handleDelete = useCallback((purchaseId) => {
    // Implement delete functionality here
    console.log("Delete purchase with ID:", purchaseId);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* PAGE HEADER */}
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

      {/* RECENT PURCHASES SECTION */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Recent Purchases
        </h2>

        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : filteredPurchases?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No purchases found
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredPurchases.slice(0, 6).map((purchase) => (
                <Link
                  to={`/dashboard/purchase/${purchase._id}`}
                  key={purchase._id}
                  className="min-w-[200px] p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition cursor-pointer shadow-sm"
                >
                  <p className="font-semibold mb-1 text-gray-800 truncate">
                    {purchase.orderName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-bold ">
                    Total Amount : ₹{purchase.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FULL TABLE LIST */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          All Purchase Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3">Order Name</th>
                <th className="py-2 px-3">Items Count</th>
                <th className="py-2 px-3 whitespace-nowrap">Created On</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases?.map((purchase) => (
                <tr
                  key={purchase._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-3 font-medium text-gray-800">
                    {purchase.orderName}
                  </td>

                  <td className="py-2 px-3 text-gray-600">
                    {purchase.items.length}
                  </td>

                  <td className="py-2 px-3 text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>

                  <Link  to={`/dashboard/purchase/${purchase._id}`}>
                  <td className="py-2 px-3  underline cursor-pointer flex items-center gap-5">
                    <Eye className="inline-block mr-1 text-blue-500" size={20} />
                    <Trash className="inline-block text-red-500" size={20} onClick={() => handleDelete(purchase._id)}/>
                  </td>
                  </Link>
                </tr>
              ))}

              {filteredPurchases?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
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
