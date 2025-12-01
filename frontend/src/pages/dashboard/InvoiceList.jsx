import React, { useEffect, useState, useCallback } from "react";
import { Eye, Trash2, Search, X, Funnel } from "lucide-react";
import InvoiceTemplate from "@/components/home/InvoiceTemplate";
import logoImg from "@/assets/logo.jpg";
import qrImg from "@/assets/qrcode.png";
import {
  useGetInvoices,
  useSearchInvoices,
  useDeleteInvoice,
} from "@/features/invoice/useInvoice";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const { mutate: fetchInvoices, isLoading: isFetchingInvoices } = useGetInvoices();
  const { mutate: removeInvoice, isLoading: isDeletingInvoice } = useDeleteInvoice();
  const { mutate: searchInvoices, isLoading: isSearchingInvoices } = useSearchInvoices();

  // Fetch all invoices
  const loadInvoices = useCallback(() => {
    if (!user?._id) return;

    fetchInvoices(user._id, {
      onSuccess: (data) => {
        setInvoices(data.invoices || []);
        setIsSearching(false);
      },
      onError: () => {
        toast.error("Failed to fetch invoices");
      },
    });
  }, [user?._id, fetchInvoices]);

  // Initial fetch on mount
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Debounced search handler
  useEffect(() => {
    if (!user?._id) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        searchInvoices(
          { UserId: user._id, query: searchQuery.trim() },
          {
            onSuccess: (data) => {
              setInvoices(data.invoices || []);
              setIsSearching(false);
            },
            onError: () => {
              toast.error("Search failed");
              setIsSearching(false);
            },
          }
        );
      } else {
        // If search is cleared, reload all invoices
        loadInvoices();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?._id, searchInvoices, loadInvoices]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  // Delete invoice with confirmation
  const handleDeleteInvoice = (invoiceId, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    removeInvoice(invoiceId, {
      onSuccess: (data) => {
        setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceId));
        toast.success(data.message || "Invoice deleted successfully");
        
        // If we were in search mode, keep the search results updated
        if (searchQuery.trim()) {
          setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceId));
        }
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete invoice");
      },
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (isNaN(Number(amount))) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isLoading = isFetchingInvoices || isSearchingInvoices;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Invoice Management
            </h1>
            <p className="text-gray-600">
              View, search, and manage all your invoices
            </p>
          </header>

          {/* Search Bar */}
          <div className="relative mb-6 flex items-center justify-between">
            <div className="relative w-full">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 " 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search by invoice number, customer name, or contact number..."
                className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
              
            </div>
            <div>
                <Funnel size={20} className="text-gray-400 ml-4" onClick={() => setFilterOpen((prev) => !prev)} />
              </div>
            {/* Search Status */}
            {isSearching && (
              <p className="text-sm text-blue-600 mt-2">Searching...</p>
            )}
            {searchQuery && !isSearching && (
              <p className="text-sm text-gray-600 mt-2">
                {invoices.length} result{invoices.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading && !invoices.length ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading invoices...</p>
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
                      {invoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-12 text-gray-500"
                          >
                            {searchQuery ? (
                              <div>
                                <p className="text-lg font-medium mb-1">
                                  No invoices found
                                </p>
                                <p className="text-sm">
                                  Try adjusting your search terms
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-lg font-medium mb-1">
                                  No invoices yet
                                </p>
                                <p className="text-sm">
                                  Create your first invoice to get started
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => (
                          <tr
                            key={invoice._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {formatDate(invoice.invoiceDate)}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              {invoice.customerName || "—"}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {invoice.contactNumber || "—"}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                              {formatCurrency(invoice.grandTotal)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => setSelectedInvoice(invoice)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Invoice"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteInvoice(
                                      invoice._id,
                                      invoice.invoiceNumber
                                    )
                                  }
                                  disabled={isDeletingInvoice}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete Invoice"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Footer */}
                {invoices.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {searchQuery ? "Found" : "Showing"}{" "}
                      <span className="font-semibold text-gray-900">
                        {invoices.length}
                      </span>{" "}
                      {invoices.length === 1 ? "invoice" : "invoices"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {filterOpen && (
        <div className="fixed top-0 bg-blue-500 ">filter is open</div>
      )}

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Invoice Preview - {selectedInvoice.invoiceNumber}
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <InvoiceTemplate
                invoice={selectedInvoice}
                owner={OWNER_ADDRESS}
                logoSrc={logoImg}
                qrSrc={qrImg}
                autoDownload={false}
                onClose={() => setSelectedInvoice(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceList;