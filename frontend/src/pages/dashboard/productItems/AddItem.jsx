import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "@/features/products/useProduct";
import { ArrowLeft, Plus } from "lucide-react";

const AddItem = () => {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    partNo: "",
    partName: "",
    tariff: "",
    GST: "",
    stock: "",
    salePrice: "",
    purchasePrice: "",
    MRP: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow numbers + decimals only for numeric fields
    const numberFields = ["tariff", "GST", "stock", "salePrice", "purchasePrice", "MRP"];

    if (numberFields.includes(name)) {
      // Allow empty string or valid decimal numbers
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.partNo.trim() || !formData.partName.trim()) {
      toast.error("Part Number and Part Name are required");
      return;
    }

    try {
      const payload = {
        partNo: formData.partNo.trim(),
        partName: formData.partName.trim(),
        tariff: formData.tariff ? Number(formData.tariff) : 0,
        GST: formData.GST ? Number(formData.GST) : 0,
        stock: formData.stock ? Number(formData.stock) : 0,
        salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
        MRP: formData.MRP ? Number(formData.MRP) : 0
      };

      await createProduct.mutateAsync(payload);

      toast.success("Product added successfully!");

      // Reset form
      setFormData({
        partNo: "",
        partName: "",
        tariff: "",
        GST: "",
        stock: "",
        salePrice: "",
        purchasePrice: "",
        MRP: ""
      });

      // Navigate back to products list
      navigate("/dashboard/productitems");
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to add product";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/productitems")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Part Number */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Part Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="partNo"
                value={formData.partNo}
                onChange={handleChange}
                placeholder="Enter part number"
                required
              />
            </div>

            {/* Part Name */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Part Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="partName"
                value={formData.partName}
                onChange={handleChange}
                placeholder="Enter part name"
                required
              />
            </div>

            {/* Tariff */}
            <div>
              <label className="text-sm font-medium block mb-1">Tariff</label>
              <Input
                name="tariff"
                value={formData.tariff}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* GST */}
            <div>
              <label className="text-sm font-medium block mb-1">GST (%)</label>
              <Input
                name="GST"
                value={formData.GST}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="text-sm font-medium block mb-1">Stock Quantity</label>
              <Input
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="text-sm font-medium block mb-1">Sale Price (₹)</label>
              <Input
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="text-sm font-medium block mb-1">Purchase Price (₹)</label>
              <Input
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* MRP */}
            <div>
              <label className="text-sm font-medium block mb-1">MRP (₹)</label>
              <Input
                name="MRP"
                value={formData.MRP}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Auto-calculated GST breakdown (optional display) */}
          {formData.GST && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>GST Breakdown:</strong> CGST: {(Number(formData.GST) / 2).toFixed(2)}% | 
                SGST: {(Number(formData.GST) / 2).toFixed(2)}% | 
                IGST: {Number(formData.GST).toFixed(2)}%
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/productitems")}
              className="flex-1"
              disabled={createProduct.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending}
              className="flex-1"
            >
              {createProduct.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddItem;