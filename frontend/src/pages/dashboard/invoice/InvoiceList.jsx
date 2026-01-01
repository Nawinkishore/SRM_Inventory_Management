import React, { useState } from "react";
import {
  Search,
  FileText,
  Filter,
  Eye,
  Download,
  Printer,
  ChevronRight,
  Calendar,
  User,
  Phone,
  CreditCard,
  TrendingUp,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/features/invoice/useInvoice";
import { BlobProvider } from "@react-pdf/renderer";
import InvoicePDF from "@/components/home/invoice/InvoicePDF";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [showFilters, setShowFilters] = useState(false);

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
  const totalPages = data?.meta?.totalPages || 1;
  const totalInvoices = data?.meta?.totalDocs || 0;

  const completedCount = invoices.filter(
    (i) => i.invoiceStatus === "completed"
  ).length;

  const pendingCount = invoices.filter(
    (i) => i.invoiceStatus === "pending"
  ).length;

  // ================= STATUS BADGE =================
  const getStatusBadge = (invoice) => {
    if (invoice.balanceDue > 0)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
          Pending
        </span>
      );

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        Completed
      </span>
    );
  };

  // ================= ERROR STATE =================
  if (isError)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Failed to load invoices
          </h3>
          <p className="text-slate-600">Please try again later</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-linear-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-2xl mb-2 transform hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-linear-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Track, manage, and organize all your invoices seamlessly
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/90 rounded-2xl shadow-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Total
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {totalInvoices}
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl shadow-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Completed
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {completedCount}
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl shadow-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Pending
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl shadow-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Page
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {page}/{totalPages}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/90 rounded-3xl shadow-2xl border overflow-hidden">
          <div
            className="flex items-center justify-between p-5 bg-linear-to-r from-blue-50 to-indigo-50 cursor-pointer lg:cursor-default"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Filters</h2>
            </div>
            <button className="lg:hidden p-2">
              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          <div className={`p-6 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex items-center gap-2 flex-wrap ">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search customer or invoice..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 h-12 bg-white border-2 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Type */}
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value);
                    setPage(1);
                  }}
                  className="h-12 bg-white border-2 rounded-xl px-4"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job-card">Job Card</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="advance">Advance</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                  className="h-12 bg-white border-2"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="bg-white/90 rounded-3xl shadow-2xl border p-16 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-slate-600 font-semibold text-lg">
              Loading invoices...
            </p>
          </div>
        )}

        {/* NO DATA */}
        {!isLoading && invoices.length === 0 && (
          <div className="bg-white/90 rounded-3xl shadow-2xl border p-16 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No invoices found
            </h3>
            <p className="text-slate-600">
              Try adjusting your filters or create a new invoice
            </p>
          </div>
        )}

        {/* TABLE */}
        {!isLoading && invoices.length > 0 && (
          <>
            <div className="lg:block bg-white/90 rounded-3xl shadow-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-slate-50 via-blue-50 to-indigo-50">
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
                    <TableRow key={inv._id}>
                      <TableCell className="font-bold text-indigo-600">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell>{inv.customer?.name}</TableCell>
                      <TableCell>{inv.customer?.phone}</TableCell>
                      <TableCell className="capitalize">
                        {inv.invoiceType}
                      </TableCell>
                      <TableCell>{getStatusBadge(inv)}</TableCell>
                      <TableCell className="font-bold">
                        ₹{inv.totalAmount?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell
                        className={`font-bold ${
                          inv.balanceDue > 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        ₹{inv.balanceDue?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/invoice/${inv._id}`)
                            }
                            className="p-2 rounded-xl text-white bg-indigo-600"
                          >
                            <Eye size={16} />
                          </button>

                          <BlobProvider document={<InvoicePDF invoice={inv} />}>
                            {({ url, loading }) => (
                              <button
                                onClick={() => {
                                  if (url) {
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `Invoice-${inv.invoiceNumber}.pdf`;
                                    a.click();
                                  }
                                }}
                                disabled={loading}
                                className="p-2"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </BlobProvider>

                          <BlobProvider document={<InvoicePDF invoice={inv} />}>
                            {({ url, loading }) => (
                              <button
                                onClick={() => url && window.open(url)}
                                disabled={loading}
                                className="p-2"
                              >
                                <Printer size={16} />
                              </button>
                            )}
                          </BlobProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="bg-white/90 rounded-2xl shadow-xl border p-4">
                <Pagination className="flex justify-center">
                  <PaginationContent>
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

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page >= totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
