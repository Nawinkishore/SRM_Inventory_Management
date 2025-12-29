import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateItem } from "@/features/items/useItems";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Hash, 
  DollarSign, 
  Percent, 
  Box,
  Save,
  X,
  ArrowLeft,
  Sparkles,
  TrendingUp
} from "lucide-react";

const AddItem = () => {
  const navigate = useNavigate();
  const { mutate: createItem, isLoading } = useCreateItem();

  const [form, setForm] = useState({
    name: "",
    partNo: "",
    salePrice: "",
    purchasePrice: "",
    gst: 18,
    stock: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.partNo) {
      toast.error("Name & Part Number are required");
      return;
    }

    createItem(
      {
        ...form,
        salePrice: Number(form.salePrice || 0),
        purchasePrice: Number(form.purchasePrice || 0),
        gst: Number(form.gst || 18),
        stock: Number(form.stock || 0),
      },
      {
        onSuccess: () => {
          toast.success("Item added successfully");
          navigate("/dashboard/stocks");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to add item");
        },
      }
    );
  };

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
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Add New Item
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Create a new inventory item with details
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Package className="w-5 h-5 text-emerald-600" />
              Item Information
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Item Name *
                  </Label>
                  <Input
                    name="name"
                    placeholder="e.g., Front Brake Pad"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">
                    Enter a descriptive name for the item
                  </p>
                </div>

                {/* Part Number */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-600" />
                    Part Number / Code *
                  </Label>
                  <Input
                    name="partNo"
                    placeholder="e.g., B97F16430400"
                    value={form.partNo}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">
                    Unique identifier or SKU
                  </p>
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        ₹
                      </span>
                      <Input
                        name="salePrice"
                        type="number"
                        placeholder="799"
                        value={form.salePrice}
                        onChange={handleChange}
                        className="pl-8 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Maximum retail price
                    </p>
                  </div>

                  {/* Purchase Price */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">
                      Purchase Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        ₹
                      </span>
                      <Input
                        name="purchasePrice"
                        type="number"
                        placeholder="650"
                        value={form.purchasePrice}
                        onChange={handleChange}
                        className="pl-8 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Cost per unit
                    </p>
                  </div>

                  {/* GST */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm flex items-center gap-2">
                      <Percent className="w-4 h-4 text-purple-600" />
                      GST %
                    </Label>
                    <Input
                      name="gst"
                      type="number"
                      value={form.gst}
                      onChange={handleChange}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500">
                      Default: 18%
                    </p>
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
                    Opening Stock Quantity
                  </Label>
                  <Input
                    name="stock"
                    type="number"
                    placeholder="10"
                    value={form.stock}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">
                    Initial quantity in stock
                  </p>
                </div>
              </div>

              {/* Profit Margin Display */}
              {form.salePrice && form.purchasePrice && Number(form.salePrice) > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">
                        Profit Analysis
                      </p>
                      <p className="text-xs text-purple-700">
                        Estimated margins per unit
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-slate-600 mb-1">Profit Amount</p>
                      <p className="text-xl font-bold text-purple-900">
                        ₹{(Number(form.salePrice) - Number(form.purchasePrice)).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-slate-600 mb-1">Margin %</p>
                      <p className="text-xl font-bold text-purple-900">
                        {((Number(form.salePrice) - Number(form.purchasePrice)) / Number(form.salePrice) * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    {form.stock && Number(form.stock) > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-purple-100 col-span-2 sm:col-span-1">
                        <p className="text-xs text-slate-600 mb-1">Total Potential</p>
                        <p className="text-xl font-bold text-purple-900">
                          ₹{((Number(form.salePrice) - Number(form.purchasePrice)) * Number(form.stock)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Required Fields Notice */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Note:</span> Fields marked with * are required
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Item
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

export default AddItem;