import React, { useState } from "react";
import {
  Search,
  FileText,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/features/invoice/useInvoice";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const InvoiceList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, isLoading, isError } = useInvoices({
    page,
    limit,
    type,
    status,
    search,
    customerName: "",
  });

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  // Status badge UI
  const getStatusBadge = (invoice) => {
    const { invoiceStatus, balanceDue } = invoice;

    if (invoiceStatus === "canceled")
      return (
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
          Canceled
        </span>
      );

    if (balanceDue > 0)
      return (
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
          Overdue
        </span>
      );

    if (invoiceStatus === "completed")
      return (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          Completed
        </span>
      );

    return (
      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium capitalize">
        {invoiceStatus}
      </span>
    );
  };

  // Error UI
  if (isError)
    return (
      <div className="text-center text-red-600 font-semibold py-16">
        Failed to load invoices
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-2">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Track and manage all your invoices in one place
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search customer or invoice..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 h-11 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="h-11 bg-white border border-slate-200 rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="job-card">Job Card</option>
              <option value="sales">Sales</option>
              <option value="quotation">Quotation</option>
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 bg-white border border-slate-200 rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading invoices...</p>
          </div>
        )}

        {/* NO DATA */}
        {!isLoading && invoices.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No invoices found
            </h3>
            <p className="text-slate-600">
              Try adjusting filters or create a new invoice
            </p>
          </div>
        )}

        {/* TABLE */}
        {!isLoading && invoices.length > 0 && (
          <>
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv._id}
                      className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-indigo-600">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {inv.customer?.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {inv.customer?.phone}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                          {inv.invoiceType}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(inv)}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{inv.totals?.grandTotal?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          inv.balanceDue > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ₹{inv.balanceDue?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/invoice/${inv._id}`)
                          }
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm"
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination className="mt-6 flex justify-center">
                <PaginationContent>
                  {/* Prev */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      disabled={page <= 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {totalPages > 7 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* NEXT */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
