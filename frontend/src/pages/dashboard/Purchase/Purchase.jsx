import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Search, Trash, Package, TrendingUp, ShoppingCart } from "lucide-react";
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
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* === HEADER === */}
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

      {/* === STATS CARDS === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Purchases</p>
              <p className="text-3xl font-bold mt-1">{stats.totalPurchases}</p>
            </div>
            <div className=" bg-opacity-20 p-3 rounded-lg">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className=" bg-opacity-20 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Items</p>
              <p className="text-3xl font-bold mt-1">{stats.totalItems}</p>
            </div>
            <div className=" bg-opacity-20 p-3 rounded-lg">
              <Package size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* === SEARCH === */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-3 border border-slate-200">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Search size={20} className="text-blue-600" />
        </div>
        <input
          type="text"
          placeholder="Search purchase by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-2 py-1 text-sm outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* === RECENT === */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-800">
            Recent Purchases
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No purchases found</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {filteredPurchases.slice(0, 6).map((purchase) => (
                <Link
                  to={`/dashboard/purchase/${purchase._id}`}
                  key={purchase._id}
                  className="min-w-[240px] p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {purchase.items.length} items
                    </span>
                  </div>
                  <p className="font-bold mb-2 text-slate-800 truncate">
                    {purchase.orderName}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{purchase.items.reduce(
                        (sum, item) => sum + item.quantity * item.price,
                        0
                      ).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === TABLE === */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800">
              All Purchase Records
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="text-slate-500 pb-4">
              Full list of purchases
            </TableCaption>

            <TableHeader>
              <TableRow className="bg-slate-50 border-b-2 border-slate-200 hover:bg-slate-50">
                <TableHead className="py-4 px-5 font-bold text-slate-700">Order Name</TableHead>
                <TableHead className="py-4 px-5 font-bold text-slate-700">Items</TableHead>
                <TableHead className="py-4 px-5 font-bold text-slate-700">Total</TableHead>
                <TableHead className="py-4 px-5 font-bold text-slate-700">Created</TableHead>
                <TableHead className="py-4 px-5 text-center font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPurchases.map((purchase, index) => {
                const totalPrice = purchase.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <TableRow
                    key={purchase._id}
                    className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <TableCell className="py-4 px-5 font-semibold text-slate-800">
                      {purchase.orderName}
                    </TableCell>

                    <TableCell className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Package size={14} />
                        {purchase.items.length}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 px-5 text-slate-800 font-bold">
                      ₹ {totalPrice.toLocaleString()}
                    </TableCell>

                    <TableCell className="py-4 px-5 text-slate-600 text-sm">
                      {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>

                    <TableCell className="py-4 px-5">
                      <div className="flex gap-3 justify-center items-center">
                        <Link to={`/dashboard/purchase/${purchase._id}`}>
                          <div className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                            <Eye size={18} className="text-blue-600" />
                          </div>
                        </Link>

                        <div 
                          className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                          onClick={() => handleDelete(purchase._id)}
                        >
                          <Trash size={18} className="text-red-600" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!isLoading && filteredPurchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <Package size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No purchase records found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === PAGINATION === */}
      {!isLoading && pagination && totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent className="bg-white rounded-xl shadow-md border border-slate-200 p-2">
              {/* Prev */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrev}
                  className={`rounded-lg transition-colors ${
                    currentPage === 1 
                      ? "opacity-40 pointer-events-none" 
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }`}
                />
              </PaginationItem>

              {/* Pages */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-slate-100"
                    }`}
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
                  className={`rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "opacity-40 pointer-events-none"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }`}
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