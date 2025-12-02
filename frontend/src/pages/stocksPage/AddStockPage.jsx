import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash, Package, Calendar, FileText, ShoppingCart } from "lucide-react";

import { useCreatePurchase } from "@/features/purchase/usePurchase";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const configureColumns = [
  {
    key: "itemNumber",
    label: "Item Number",
    name: "item-number",
    placeholder: "Enter Item Number",
  },
  { key: "quantity", label: "Qty", name: "quantity", placeholder: "Qty" },
  { key: "price", label: "Price", name: "price", placeholder: "₹ Price" },
  { key: "total", label: "Total", name: "total", placeholder: "₹ Total" },
];

const AddStockPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([
    { itemNumber: "", quantity: "", price: "", total: "" },
  ]);
  const { mutate: createPurchase, loading } = useCreatePurchase();
  const [orderName, setOrderName] = useState("");
  const date = new Date().toLocaleDateString();

  const handleChange = (index, field, value) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      updated[index][field] = value;

      if (field === "quantity" || field === "price") {
        const qty = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(updated[index].price) || 0;
        updated[index].total = qty * price;
      }
      return updated;
    });
  };

  const addRows = () =>
    setRows((prev) => [
      ...prev,
      { itemNumber: "", quantity: "", price: "", total: "" },
    ]);

  const removeRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSaveOrder = () => {
    const purchaseData = {
      userId: user._id,
      orderName,
      items: rows,
    };
    createPurchase(purchaseData, {
      onSuccess: (data) => {
        toast.success(data.message || "Purchase order created successfully");
        setOrderName("");
        setRows([{ itemNumber: "", quantity: "", price: "", total: "" }]);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to create purchase order"
        );
      },
    });
  };

  const grandTotal = rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);

  // Check for duplicate item numbers
  const getDuplicateItemNumbers = () => {
    const itemNumbers = rows
      .map(row => row.itemNumber.trim())
      .filter(num => num !== "");
    
    const duplicates = itemNumbers.filter((item, index) => 
      itemNumbers.indexOf(item) !== index
    );
    
    return [...new Set(duplicates)];
  };

  const duplicates = getDuplicateItemNumbers();
  const hasDuplicates = duplicates.length > 0;

  const isItemNumberDuplicate = (itemNumber) => {
    if (!itemNumber.trim()) return false;
    return duplicates.includes(itemNumber.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard/purchase">
              <Button 
                variant="outline" 
                className="shadow-sm hover:shadow-md transition-all duration-200 border-slate-300 hover:border-blue-400"
              >
                ← Back
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-800">New Purchase Order</h1>
            </div>
          </div>

          {/* Order Info Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                type="text"
                placeholder="Order Name"
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm w-full sm:w-60
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                       shadow-sm hover:border-slate-400 bg-white"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={date}
                readOnly
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm w-full sm:w-44
                       bg-slate-50 font-medium text-slate-700 shadow-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Stock Items</h2>
              <p className="text-blue-100 text-sm">Add items to your purchase order</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* TABLE VIEW - Desktop & Tablet */}
          <div className="hidden md:block overflow-hidden border border-slate-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    {configureColumns.map((column) => (
                      <TableHead
                        key={column.key}
                        className="text-center whitespace-nowrap text-sm font-semibold text-slate-700 py-4"
                      >
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-center text-sm font-semibold text-slate-700 py-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow 
                      key={rowIndex} 
                      className="hover:bg-blue-50/50 transition-colors border-b border-slate-100"
                    >
                      {configureColumns.map((col) => (
                        <TableCell key={col.key} className="text-center py-3">
                          <div className="relative">
                            <input
                              type="text"
                              name={col.name}
                              placeholder={col.placeholder}
                              value={row[col.key]}
                              onChange={(e) =>
                                handleChange(rowIndex, col.key, e.target.value)
                              }
                              readOnly={col.key === "total"}
                              className={`w-full border rounded-lg px-3 py-2.5 text-sm 
                                transition-all duration-200
                                ${
                                  col.key === "total"
                                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 font-bold text-blue-900 cursor-not-allowed"
                                    : col.key === "itemNumber" && isItemNumberDuplicate(row[col.key])
                                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                    : "border-slate-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                }
                              `}
                            />
                            {col.key === "itemNumber" && isItemNumberDuplicate(row[col.key]) && (
                              <div className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">
                                Duplicate item
                              </div>
                            )}
                          </div>
                        </TableCell>
                      ))}

                      <TableCell className="text-center py-3">
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 
                                 hover:from-red-600 hover:to-red-700 text-white 
                                 transition-all duration-200 shadow-md hover:shadow-lg 
                                 transform hover:scale-105"
                        >
                          <Trash size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* MOBILE VIEW - CARD MODE */}
          <div className="md:hidden space-y-4">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="border-2 border-slate-200 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 
                         shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-700">Item #{rowIndex + 1}</span>
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {row.itemNumber || "New"}
                  </div>
                </div>

                {configureColumns.map((col) => (
                  <div key={col.key} className="mb-3">
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wide">
                      {col.label}
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        name={col.name}
                        placeholder={col.placeholder}
                        value={row[col.key]}
                        onChange={(e) =>
                          handleChange(rowIndex, col.key, e.target.value)
                        }
                        readOnly={col.key === "total"}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm
                          transition-all duration-200
                          ${
                            col.key === "total"
                              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 font-bold text-blue-900"
                              : col.key === "itemNumber" && isItemNumberDuplicate(row[col.key])
                              ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          }
                        `}
                      />
                      {col.key === "itemNumber" && isItemNumberDuplicate(row[col.key]) && (
                        <div className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span>⚠</span> Duplicate item number
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => removeRow(rowIndex)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 
                         bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                         text-white rounded-lg transition-all duration-200 text-sm font-semibold
                         shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <Trash size={14} />
                  Remove Item
                </button>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          {rows.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">Total Items:</span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                    {rows.length}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium mb-1">Grand Total</div>
                  <div className="text-2xl font-bold text-blue-700">
                    ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {hasDuplicates && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                !
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Duplicate Item Numbers Detected</h4>
                <p className="text-sm text-red-700">
                  The following item numbers are duplicated: <span className="font-semibold">{duplicates.join(", ")}</span>
                </p>
                <p className="text-xs text-red-600 mt-1">Please ensure all item numbers are unique before saving.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 mt-8">
            <button
              onClick={addRows}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 
                     hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl 
                     shadow-lg hover:shadow-xl transition-all duration-200 font-semibold
                     transform hover:scale-[1.02]"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Add Row</span>
            </button>

            <button
              onClick={handleSaveOrder}
              disabled={loading || hasDuplicates}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl 
                     shadow-lg hover:shadow-xl transition-all duration-200 font-semibold
                     transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:scale-100 disabled:from-slate-400 disabled:to-slate-500"
            >
              <Package size={20} />
              <span>{loading ? "Saving..." : hasDuplicates ? "Fix Duplicates" : "Save Order"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockPage;