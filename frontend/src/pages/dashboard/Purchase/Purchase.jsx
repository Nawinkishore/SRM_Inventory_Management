import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Search, Trash, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";

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

import { usePurchaseList, useDeletePurchase } from "@/features/purchase/usePurchase";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
const Purchase = () => {
  const { user } = useUser();

  // pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // fetch from React Query
  const { data, isLoading } = usePurchaseList({
    userId: user?._id,
    page,
    limit,
  });

  const purchases = data?.purchases || [];
  const pagination = data?.pagination;

  // delete mutation
  const { mutate: deletePurchase } = useDeletePurchase(user?._id);

  const [query, setQuery] = useState("");

  // Filter results (NO redux now)
  const filteredPurchases = useMemo(() => {
    return purchases.filter((order) =>
      order.orderName.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, purchases]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredPurchases.reduce((sum, purchase) => {
      return sum + purchase.items.reduce((itemSum, item) => 
        itemSum + item.quantity * item.price, 0);
    }, 0);

    return {
      totalPurchases: filteredPurchases.length,
      totalValue: total,
      totalItems: filteredPurchases.reduce((sum, p) => sum + p.items.length, 0)
    };
  }, [filteredPurchases]);

  const handleDelete = useCallback(
    (purchaseId) => {
      if (!window.confirm("Are you sure you want to delete this order?"))
        return;

      deletePurchase(purchaseId, {
        onSuccess: () => toast.success("Purchase deleted successfully"),
        onError: () => toast.error("Failed to delete purchase"),
      });
    },
    [deletePurchase]
  );

  /** pagination */
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const handlePrev = () => currentPage > 1 && setPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setPage(currentPage + 1);

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600" size={32} />
            Stock Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your purchase orders and inventory</p>
        </div>

        <Link to="/dashboard/purchase/stocks/add">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-200">
            <ShoppingCart size={18} className="mr-2" />
            Add Purchase
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Purchases</p>
          <p className="text-3xl font-bold mt-1">{stats.totalPurchases}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-emerald-100 text-sm font-medium">Total Value</p>
          <p className="text-3xl font-bold mt-1">₹{stats.totalValue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-purple-100 text-sm font-medium">Total Items</p>
          <p className="text-3xl font-bold mt-1">{stats.totalItems}</p>
        </div>

      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-3 border border-slate-200">
        <Search size={20} className="text-blue-600" />
        <input
          type="text"
          placeholder="Search purchase by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-2 py-1 text-sm outline-none text-slate-700"
        />
      </div>

      {/* RECENT PURCHASES */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Purchases</h2>

        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No purchases found</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredPurchases.slice(0, 6).map((purchase) => (
                <Link
                  to={`/dashboard/purchase/${purchase._id}`}
                  key={purchase._id}
                  className="min-w-[240px] p-5 rounded-xl border bg-white shadow hover:shadow-lg"
                >
                  <p className="font-bold text-slate-800 truncate">{purchase.orderName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-3 text-blue-600 font-bold text-xl">
                    ₹ {purchase.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">

        <div className="p-5 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">All Purchase Records</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Order Name</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody >
              {filteredPurchases.map((purchase) => {
                const totalPrice = purchase.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <TableRow key={purchase._id}>
                    <TableCell>{purchase.orderName}</TableCell>
                    <TableCell>{purchase.items.length}</TableCell>
                    <TableCell>₹ {totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3 justify-center">
                        <Link to={`/dashboard/purchase/${purchase._id}`}>
                          <Eye size={18} className="text-blue-600 cursor-pointer" />
                        </Link>

                        <Trash
                          size={18}
                          className="text-red-600 cursor-pointer"
                          onClick={() => handleDelete(purchase._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!isLoading && filteredPurchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No purchases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableCaption>Complete list of purchase records</TableCaption>
          </Table>
        </div>
      </div>

      {/* PAGINATION */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>

              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrev}
                  className={currentPage === 1 ? "opacity-40 pointer-events-none" : ""}
                />
              </PaginationItem>

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

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNext}
                  className={currentPage === totalPages ? "opacity-40 pointer-events-none" : ""}
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
