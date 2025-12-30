import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Package, 
  Hash, 
  DollarSign, 
  Percent, 
  Box,
  Save,
  X,
  ArrowLeft,
  TrendingUp
} from "lucide-react";

import {
  useItemById,
  useUpdateItem
} from "@/features/items/useItems";


const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useItemById(id);
  const { mutate: updateItem, isLoading: saving } = useUpdateItem(id);

  const [form, setForm] = useState({
    name: "",
    partNo: "",
    salePrice: "",
    purchasePrice: "",
    gst: "18",
    stock: "0"
  });

  // load data into form once fetched
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        partNo: item.partNo || "",
        salePrice: String(item.salePrice || "0"),
        purchasePrice: String(item.purchasePrice || "0"),
        gst: String(item.gst || "18"),
        stock: String(Math.max(0, item.stock || 0))
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, allow only valid number inputs
    if (name === 'stock' || name === 'salePrice' || name === 'purchasePrice' || name === 'gst') {
      // Allow empty string, digits, and decimal point
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
      
      // Prevent negative values
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue < 0) {
        return;
      }
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.partNo) {
      toast.error("Name & Part Number are required");
      return;
    }

    // Convert string values to numbers, ensuring non-negative values
    const stockValue = Math.max(0, parseInt(form.stock) || 0);
    const salePriceValue = Math.max(0, parseFloat(form.salePrice) || 0);
    const purchasePriceValue = Math.max(0, parseFloat(form.purchasePrice) || 0);
    const gstValue = Math.max(0, parseFloat(form.gst) || 18);

    updateItem(
      {
        name: form.name.trim(),
        partNo: form.partNo.trim(),
        salePrice: salePriceValue,
        purchasePrice: purchasePriceValue,
        gst: gstValue,
        stock: stockValue,
      },
      {
        onSuccess: () => {
          toast.success("Item updated successfully");
          navigate("/dashboard/stocks");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Update failed");
        }
      }
    );
  };

  // Calculate profit safely
  const salePrice = parseFloat(form.salePrice) || 0;
  const purchasePrice = parseFloat(form.purchasePrice) || 0;
  const stock = parseInt(form.stock) || 0;
  const profitPerUnit = salePrice - purchasePrice;
  const profitMargin = salePrice > 0 ? ((profitPerUnit / salePrice) * 100) : 0;
  const totalPotential = profitPerUnit * stock;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
            <p className="text-slate-600 font-medium">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg">Failed to load item</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-amber-600 font-semibold text-lg">Item not found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/dashboard/stocks")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Edit Item
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Update item details and inventory
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Item Information
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Item Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Item Name *
                  </Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>

                {/* Part Number */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    Part Number *
                  </Label>
                  <Input
                    name="partNo"
                    value={form.partNo}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter part number"
                  />
                </div>

              </div>

              {/* Pricing Section */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Sale Price */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">
                      Sale Price (MRP)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        ₹
                      </span>
                      <Input
                        name="salePrice"
                        type="text"
                        inputMode="decimal"
                        value={form.salePrice}
                        onChange={handleChange}
                        className="pl-7 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Purchase Price */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">
                      Purchase Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        ₹
                      </span>
                      <Input
                        name="purchasePrice"
                        type="text"
                        inputMode="decimal"
                        value={form.purchasePrice}
                        onChange={handleChange}
                        className="pl-7 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* GST */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm flex items-center gap-2">
                      <Percent className="w-4 h-4 text-purple-600" />
                      GST %
                    </Label>
                    <Input
                      name="gst"
                      type="text"
                      inputMode="decimal"
                      value={form.gst}
                      onChange={handleChange}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="18"
                    />
                  </div>

                </div>
              </div>

              {/* Inventory Section */}
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <h3 className="text-sm font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Inventory
                </h3>
                
                <div className="space-y-2 max-w-xs">
                  <Label className="text-slate-700 font-medium">
                    Stock Quantity
                  </Label>
                  <Input
                    name="stock"
                    type="text"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500">
                    Current available stock units (cannot be negative)
                  </p>
                </div>
              </div>

              {/* Profit Margin Display */}
              {salePrice > 0 && purchasePrice > 0 && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-purple-900 font-medium">Estimated Profit Margin</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Per unit profit after purchase
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-900">
                        ₹{profitPerUnit.toFixed(2)}
                      </p>
                      <p className="text-xs text-purple-700">
                        {profitMargin.toFixed(1)}% margin
                      </p>
                    </div>
                  </div>
                  
                  {stock > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-purple-100 mt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-600">Total Potential Profit</p>
                        <p className="text-lg font-bold text-purple-900">
                          ₹{totalPotential.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Item
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EditItem;