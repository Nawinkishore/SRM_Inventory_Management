import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Search, Trash, Edit, Layers, Package, DollarSign, TrendingUp } from "lucide-react";

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";

import {
  useItems,
  useDeleteItem,
  useStockSummary
} from "@/features/items/useItems";


const Stock = () => {

  const [page, setPage] = useState(1);
  const limit = 10;
  const [query, setQuery] = useState("");

  const { data, isLoading } = useItems({ page, limit, q: query });
  const { data: summary } = useStockSummary();
  const { mutate: deleteItem } = useDeleteItem();

  const items = data?.items || [];
  const pagination = data?.pagination || {};

  const handleDelete = (id) => {
    if (!window.confirm("Delete this item?")) return;

    deleteItem(id, {
      onSuccess: () => toast.success("Item deleted"),
      onError: () => toast.error("Failed to delete")
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Stock Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your inventory efficiently
            </p>
          </div>
        </div>

        <Link to="/dashboard/stocks/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
            <Package className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Items</p>
          <h2 className="text-4xl font-bold">{pagination?.total || 0}</h2>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Layers className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Quantity</p>
          <h2 className="text-4xl font-bold">{summary?.totalQty || 0}</h2>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Stock Value</p>
          <h2 className="text-4xl font-bold">
            ₹{(summary?.totalStockValue || 0).toLocaleString()}
          </h2>
        </div>

      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-slate-200">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item or part number…"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading items...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Part No</TableHead>
                  <TableHead className="font-semibold text-slate-700">Stock</TableHead>
                  <TableHead className="font-semibold text-slate-700">Sale Price</TableHead>
                  <TableHead className="font-semibold text-slate-700 hidden sm:table-cell">Purchase Price</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map(item => (
                  <TableRow key={item._id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.partNo}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.stock > 50 ? 'bg-emerald-100 text-emerald-700' : 
                        item.stock > 20 ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">₹{item.salePrice}</TableCell>
                    <TableCell className="text-slate-600 hidden sm:table-cell">₹{item.purchasePrice}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Link to={`/dashboard/stocks/edit/${item._id}`}>
                          <div className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          </div>
                        </Link>

                        <div 
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer group"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-slate-100 p-4 rounded-full">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No items found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent className="flex-wrap gap-2">

              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                />
              </PaginationItem>

              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pagination.currentPage === i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`cursor-pointer rounded-lg transition-all ${
                      pagination.currentPage === i + 1 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage(p => Math.min(pagination.totalPages, p + 1))
                  }
                  className="cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        </div>
      )}

    </div>
  );
};

export default Stock;