import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Search, Trash } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  // pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = usePurchaseList({
    userId: user?._id,
    page,
    limit,
  });

  const purchases = data?.purchases || [];
  const pagination = data?.pagination;

  const { mutate: deletePurchase } = useDeletePurchase(user?._id);

  // sync into redux
  useEffect(() => {
    if (!purchases) return;
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

  const handleDelete = useCallback(
    (purchaseId) => {
      if (!window.confirm("Are you sure you want to delete this order?"))
        return;

      dispatch(removePurchaseState(purchaseId));
      deletePurchase(purchaseId, {
        onSuccess: () => toast.success("Purchase deleted successfully"),
        onError: () => toast.error("Failed to delete purchase"),
      });
    },
    [deletePurchase, dispatch]
  );

  /** pagination handlers */
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const handlePrev = () => currentPage > 1 && setPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setPage(currentPage + 1);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* === HEADER === */}
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

      {/* === SEARCH === */}
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

      {/* === RECENT === */}
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

      {/* === TABLE === */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          All Purchase Records
        </h2>

        <Table>
          <TableCaption className="text-gray-500">
            Full list of purchases
          </TableCaption>

          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="py-2 px-3">Order Name</TableHead>
              <TableHead className="py-2 px-3">Items</TableHead>
              <TableHead className="py-2 px-3">Total</TableHead>
              <TableHead className="py-2 px-3">Created</TableHead>
              <TableHead className="py-2 px-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPurchases.map((purchase) => {
              const totalPrice = purchase.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <TableRow
                  key={purchase._id}
                  className="border-b hover:bg-gray-50"
                >
                  <TableCell className="py-2 px-3 font-medium text-gray-800">
                    {purchase.orderName}
                  </TableCell>

                  <TableCell className="py-2 px-3 text-gray-600">
                    {purchase.items.length}
                  </TableCell>

                  <TableCell className="py-2 px-3 text-gray-600 font-semibold">
                    ₹ {totalPrice}
                  </TableCell>

                  <TableCell className="py-2 px-3 text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="py-2 px-3 flex gap-4 justify-center items-center">
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
                  </TableCell>
                </TableRow>
              );
            })}

            {!isLoading && filteredPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                  No purchase records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* === PAGINATION === */}
      {!isLoading && pagination && (
        <div className="mt-5">
          <Pagination>
            <PaginationContent>
              {/* Prev */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrev}
                  className={
                    currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                  }
                />
              </PaginationItem>

              {/* Pages */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNext}
                  className={
                    currentPage === totalPages
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Purchase;
