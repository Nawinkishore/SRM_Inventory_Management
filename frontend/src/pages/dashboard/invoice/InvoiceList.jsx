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

// IMPORTANT: Remove the pdf import - we'll use BlobProvider instead
// import { pdf } from "@react-pdf/renderer";
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
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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
  console.log("InvoiceList Rendered with invoices:", invoices);

  // Status badge UI
  const getStatusBadge = (invoice) => {
    const { invoiceStatus, balanceDue } = invoice;
    console.log("Rendering status badge for invoice:", invoice);
    if (invoiceStatus === "canceled")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
          Canceled
        </span>
      );

    if (balanceDue > 0)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
          Overdue
        </span>
      );

    if (invoiceStatus === "completed")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
          Completed
        </span>
      );

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold capitalize">
        {invoiceStatus}
      </span>
    );
  };

  // Error UI
  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-2xl mb-2 transform hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Track, manage, and organize all your invoices seamlessly
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Total</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {data?.pagination?.total || 0}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Completed</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {invoices.filter((i) => i.invoiceStatus === "completed").length}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Overdue</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {invoices.filter((i) => i.balanceDue > 0).length}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Page</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {page}/{totalPages}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer lg:cursor-default"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Filters
              </h2>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ChevronRight
                className={`w-5 h-5 text-slate-600 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          <div
            className={`p-4 sm:p-5 md:p-6 ${
              showFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                  className="w-full pl-11 pr-4 h-12 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Type */}
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="h-12 bg-white border-2 border-slate-200 rounded-xl text-sm px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
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
                className="h-12 bg-white border-2 border-slate-200 rounded-xl text-sm px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-12 sm:p-16 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-slate-600 font-semibold text-lg">
              Loading invoices...
            </p>
          </div>
        )}

        {/* NO DATA */}
        {!isLoading && invoices.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-12 sm:p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No invoices found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Try adjusting your filters or create a new invoice to get started
            </p>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!isLoading && invoices.length > 0 && (
          <>
            <div className="hidden lg:block bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:via-blue-50 hover:to-indigo-50">
                    <TableHead className="font-bold text-slate-900">Invoice No</TableHead>
                    <TableHead className="font-bold text-slate-900">Customer</TableHead>
                    <TableHead className="font-bold text-slate-900">Phone</TableHead>
                    <TableHead className="font-bold text-slate-900">Type</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="font-bold text-slate-900">Total</TableHead>
                    <TableHead className="font-bold text-slate-900">Balance</TableHead>
                    <TableHead className="font-bold text-slate-900">Date</TableHead>
                    <TableHead className="text-right font-bold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv._id}
                      className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all cursor-pointer"
                    >
                      <TableCell className="font-bold text-indigo-600">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {inv.customer?.name}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {inv.customer?.phone}
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold rounded-full capitalize">
                          {inv.invoiceType}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(inv)}</TableCell>
                      <TableCell className="font-bold text-slate-900">
                        ₹{inv.totals?.grandTotal?.toLocaleString("en-IN")}
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
                      <TableCell className="text-slate-600 font-medium">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/invoice/${inv._id}`)
                            }
                            className="p-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Download with BlobProvider */}
                          <BlobProvider document={<InvoicePDF invoice={inv} />}>
                            {({ blob, url, loading, error }) => (
                              <button
                                onClick={() => {
                                  if (url) {
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `Invoice-${inv.invoiceNumber}.pdf`;
                                    link.click();
                                  }
                                }}
                                disabled={loading}
                                className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                                title={loading ? "Generating PDF..." : "Download PDF"}
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </BlobProvider>

                          {/* Print with BlobProvider */}
                          <BlobProvider document={<InvoicePDF invoice={inv} />}>
                            {({ blob, url, loading, error }) => (
                              <button
                                onClick={() => {
                                  if (url) {
                                    const printWindow = window.open(url, '_blank');
                                    if (printWindow) {
                                      printWindow.onload = () => {
                                        printWindow.print();
                                      };
                                    }
                                  }
                                }}
                                disabled={loading}
                                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                                title={loading ? "Generating PDF..." : "Print Invoice"}
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

            {/* MOBILE CARDS */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {invoices.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-slate-600 font-medium mb-1">
                          Invoice No.
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          {inv.invoiceNumber}
                        </p>
                      </div>
                      {getStatusBadge(inv)}
                    </div>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold rounded-full capitalize">
                      {inv.invoiceType}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">
                          Customer
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {inv.customer?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {inv.customer?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Date</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          Total Amount
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          ₹{inv.totals?.grandTotal?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          Balance Due
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            inv.balanceDue > 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          ₹{inv.balanceDue?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/invoice/${inv._id}`)
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      
                      {/* Download with BlobProvider */}
                      <BlobProvider document={<InvoicePDF invoice={inv} />}>
                        {({ blob, url, loading, error }) => (
                          <button
                            onClick={() => {
                              if (url) {
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `Invoice-${inv.invoiceNumber}.pdf`;
                                link.click();
                              }
                            }}
                            disabled={loading}
                            className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                            title={loading ? "Generating..." : "Download"}
                          >
                            <Download size={18} />
                          </button>
                        )}
                      </BlobProvider>

                      {/* Print with BlobProvider */}
                      <BlobProvider document={<InvoicePDF invoice={inv} />}>
                        {({ blob, url, loading, error }) => (
                          <button
                            onClick={() => {
                              if (url) {
                                const printWindow = window.open(url, '_blank');
                                if (printWindow) {
                                  printWindow.onload = () => {
                                    printWindow.print();
                                  };
                                }
                              }
                            }}
                            disabled={loading}
                            className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                            title={loading ? "Generating..." : "Print"}
                          >
                            <Printer size={18} />
                          </button>
                        )}
                      </BlobProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
                <Pagination className="flex justify-center">
                  <PaginationContent className="flex-wrap gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page <= 1}
                        className="rounded-xl hover:bg-indigo-50 transition-colors"
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(totalPages, 7) }).map(
                      (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={page === i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`rounded-xl transition-all ${
                              page === i + 1
                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg"
                                : "hover:bg-indigo-50"
                            }`}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    {totalPages > 7 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="rounded-xl hover:bg-indigo-50 transition-colors"
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