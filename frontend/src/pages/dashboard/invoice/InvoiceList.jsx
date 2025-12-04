import React, { useState } from "react";
import { Search, FileText, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/features/invoice/useInvoice";

const InvoiceList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const limit = 10;

  // API fetching (Backend handles filters & pagination)
  const { data, isLoading, isError } = useInvoices({
    page,
    limit,
    type,
    status,
    search,
    customerName: "", // Optional if needed
  });

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  // Status Pill UI - unchanged
  const getStatusBadge = (invoice) => {
    const { invoiceStatus, balanceDue } = invoice;
    
    if (invoiceStatus === "canceled") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Canceled
        </span>
      );
    }
    
    if (balanceDue > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    
    if (invoiceStatus === "completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
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

  // BEGIN UI (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header Section */}
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

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search customer or invoice..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 h-11 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            {/* Invoice Type */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="h-11 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm px-3"
            >
              <option value="all">All Types</option>
              <option value="job-card">Job Card</option>
              <option value="sales">Sales</option>
              <option value="quotation">Quotation</option>
            </select>

            {/* Invoice Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm px-3"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Loading UI */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading invoices...</p>
          </div>
        )}

        {/* Empty UI */}
        {!isLoading && invoices.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No invoices found
            </h3>
            <p className="text-slate-600">
              Try adjusting your filters or create a new invoice
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!isLoading && invoices.length > 0 && (
          <>
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Invoice No
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Phone
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Type
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Total
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Balance
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                      Date
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-900 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-indigo-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {inv.customer?.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {inv.customer?.phone}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {inv.invoiceType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(inv)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        ₹{inv.totals?.grandTotal?.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`py-4 px-6 font-semibold ${
                          inv.balanceDue > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{inv.balanceDue?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/invoice/${inv._id}`)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {invoices.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4">
                <button
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page <= 1}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    page <= 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        page === i + 1
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => page < totalPages && setPage(page + 1)}
                  disabled={page >= totalPages}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    page >= totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
