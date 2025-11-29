// File: src/pages/InvoiceList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Download } from "lucide-react";
import { useGetInvoices } from "@/features/invoice/useInvoice";
import { useSelector } from "react-redux";
import InvoiceTemplate from "@/components/home/InvoiceTemplate";
import logoImg from "@/assets/logo.jpg";
import qrImg from "@/assets/qrcode.png";

const OWNER_ADDRESS = {
  name: "SRM MOTORS",
  addressLines: [
    "2/89C, Anna Nagar,",
    "Jayamkondam Main Road,",
    "Sendurai Po & Tk",
    "Ariyalur DT",
  ],
  phone: "7825914040",
  email: "srmmotorssendurai@gmail.com",
  gst: "33BWLPM0667D1ZM",
  stateInfo: "State: 33-Tamil Nadu",
};

const InvoiceList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get invoices from Redux store
  const { invoices = [], loading: reduxLoading } = useSelector(
    (state) => state.invoice
  );

  // Fetch invoices with React Query (keeps your existing behavior)
  // If your useGetInvoices already returns the entire list, you can use it for refetching/search.
  const { isLoading, isError, error, refetch } = useGetInvoices(searchQuery);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage, setInvoicesPerPage] = useState(10); // renders 10 invoices per page

  // Combine loading states
  const loading = isLoading || reduxLoading;

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search when input is empty
  useEffect(() => {
    if (searchInput.trim() === "") {
      setSearchQuery("");
    }
  }, [searchInput]);

  // Reset page whenever searchQuery or invoices change (so user sees first page of results)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, invoices.length]);

  // View invoice (no auto-download)
  const handleViewInvoice = (invoice) => {
    setAutoDownload(false);
    setSelectedInvoice(invoice);
  };

  // Download invoice (auto-download)
  const handleDownloadInvoice = (invoice) => {
    setAutoDownload(true);
    setSelectedInvoice(invoice);
  };

  // Close modal
  const closeModal = () => {
    setSelectedInvoice(null);
    setAutoDownload(false);
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(Number(amount))) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ========== Pagination logic ==========
  // Optionally filter client-side based on searchQuery (if server already filters, you can skip this)
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices;
    const q = searchQuery.toString().toLowerCase();
    return invoices.filter((inv) => {
      const fields = [
        inv.invoiceNumber,
        inv.customerName,
        inv.contactNumber,
        // add other fields if needed
      ]
        .filter(Boolean)
        .map((v) => v.toString().toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [invoices, searchQuery]);

  const totalInvoices = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / invoicesPerPage));
  const startIdx = (currentPage - 1) * invoicesPerPage;
  const endIdx = startIdx + invoicesPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIdx, endIdx);

  // helper to change page safely
  const gotoPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  // Generate a compact list of page numbers (e.g., 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    // always show first and last, and a window around current page
    pages.push(1);
    let left = Math.max(2, currentPage - 2);
    let right = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 3) {
      left = 2;
      right = 5;
    }
    if (currentPage >= totalPages - 2) {
      left = totalPages - 4;
      right = totalPages - 1;
    }
    if (left > 2) pages.push("left-ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("right-ellipsis");
    pages.push(totalPages);
    return pages;
  };

  // =======================================

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Invoice Management
            </h1>
            <p className="text-gray-600">Search and manage all your invoices</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Phone Number, Customer Name, or Invoice Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  Failed to load invoices
                </div>
                <p className="text-gray-500">
                  {error?.message || "An unknown error occurred"}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : totalInvoices === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">
                  No invoices found
                </p>
                <p className="text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Start by searching for an invoice"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Invoice No.
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Customer Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact Number
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedInvoices.map((invoice) => (
                        <tr
                          key={invoice._id || invoice.invoiceNumber}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-blue-600">
                              {invoice.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {formatDate(invoice.invoiceDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {invoice.customerName || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {invoice.contactNumber || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(invoice.grandTotal)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleViewInvoice(invoice)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Invoice"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(invoice)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {startIdx + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(endIdx, totalInvoices)}
                    </span>{" "}
                    of <span className="font-semibold">{totalInvoices}</span>{" "}
                    invoices
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Page size selector (optional) */}
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                      <label>Per page:</label>
                      <select
                        value={invoicesPerPage}
                        onChange={(e) => {
                          setInvoicesPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => gotoPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                        aria-label="Previous page"
                      >
                        Prev
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((p, idx) =>
                          p === "left-ellipsis" || p === "right-ellipsis" ? (
                            <span key={p + idx} className="px-2 text-sm">
                              &hellip;
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => gotoPage(p)}
                              className={`px-3 py-1 rounded ${
                                p === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "border hover:bg-gray-100"
                              } text-sm`}
                              aria-current={p === currentPage ? "page" : false}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => gotoPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Invoice Preview
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <InvoiceTemplate
                invoice={selectedInvoice}
                owner={OWNER_ADDRESS}
                logoSrc={logoImg}
                qrSrc={qrImg}
                onClose={closeModal}
                autoDownload={autoDownload}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceList;
