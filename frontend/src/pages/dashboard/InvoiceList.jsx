// File: src/pages/InvoiceList.jsx
import React, { useEffect, useState } from "react";
import { Search, Eye, Download } from "lucide-react";
import InvoiceTemplate from "@/components/home/InvoiceTemplate";
import logoImg from "@/assets/logo.jpg";
import qrImg from "@/assets/qrcode.png";
import { useGetInvoices } from "@/features/invoice/useInvoice";
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
  const [searchInput, setSearchInput] = useState("");
  const [invoices, setInvoices] = useState([]); // manage invoices locally
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const {mutate: fetchInvoices} = useGetInvoices();
  useEffect(()=>{
    fetchInvoices(user._id, {
      onSuccess: (data) => {
        setInvoices(data.invoices || []);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to fetch invoices");
      },
    });
  },[])
  const handleViewInvoice = (invoice) => {
    setAutoDownload(false);
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = (invoice) => {
    setAutoDownload(true);
    setSelectedInvoice(invoice);
  };

  const closeModal = () => {
    setSelectedInvoice(null);
    setAutoDownload(false);
  };

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

  // Simple client-side filter (instant)
  const filteredInvoices = (invoices || []).filter((inv) => {
    if (!searchInput) return true;
    const q = searchInput.toLowerCase();
    return (
      String(inv.invoiceNumber || "").toLowerCase().includes(q) ||
      String(inv.customerName || "").toLowerCase().includes(q) ||
      String(inv.contactNumber || "").toLowerCase().includes(q)
    );
  });

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
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by phone, customer or invoice no."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">
                  No invoices found
                </p>
                <p className="text-gray-400">
                  {invoices.length === 0
                    ? "No invoices added yet"
                    : "Try adjusting your search"}
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
                      {filteredInvoices.map((invoice) => (
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

                {/* Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredInvoices.length}
                    </span>{" "}
                    {filteredInvoices.length === 1 ? "invoice" : "invoices"}
                  </p>
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
