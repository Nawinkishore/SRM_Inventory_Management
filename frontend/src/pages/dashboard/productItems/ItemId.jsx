
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useProductById, useUpdateProduct } from "@/features/products/useProduct";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X } from "lucide-react";

const ItemId = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useProductById(id);
  const { mutate: updateProduct } = useUpdateProduct(id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    partName: "",
    partNo: "",
    largeGroup: "",
    tariff: "",
    IGSTCode: "",
    stock: "",
    salePrice: "",
    purchasePrice: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        partName: data.partName || "",
        partNo: data.partNo || "",
        largeGroup: data.largeGroup || "",
        tariff: data.tariff || "",
        IGSTCode: data.IGSTCode || "",
        stock: data.stock || "",
        salePrice: data.salePrice || "",
        purchasePrice: data.purchasePrice || "",
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const decimalFields = ["tariff", "IGSTCode", "stock", "salePrice", "purchasePrice"];

    if (decimalFields.includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    toast.success("You can now edit the product details.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (data) {
      setFormData({
        partName: data.partName || "",
        partNo: data.partNo || "",
        largeGroup: data.largeGroup || "",
        tariff: data.tariff || "",
        IGSTCode: data.IGSTCode || "",
        stock: data.stock || "",
        salePrice: data.salePrice || "",
        purchasePrice: data.purchasePrice || "",
      });
    }
    toast.error("Your changes have been discarded.");
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      tariff: Number(formData.tariff || 0),
      IGSTCode: Number(formData.IGSTCode || 0),
      stock: Number(formData.stock || 0),
      salePrice: Number(formData.salePrice || 0),
      purchasePrice: Number(formData.purchasePrice || 0),
    };

    updateProduct(payload, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Product details updated successfully.");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update product details.");
      }
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading item</p>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">

      <div className="flex gap-2 mb-6">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <Link to="/dashboard/productitems">
            <Button variant={'ghost'}>
                <ChevronLeft />
                Back</Button>
            </Link>
            <Button onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          </div>
        ) : (
          <>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Part Name</label>
          <Input
            name="partName"
            value={formData.partName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Part No</label>
          <Input
            name="partNo"
            value={formData.partNo}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Large Group</label>
          <Input
            name="largeGroup"
            value={formData.largeGroup}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tariff</label>
          <Input
            type="text"
            name="tariff"
            value={formData.tariff}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">GST</label>
          <Input
            type="text"
            name="IGSTCode"
            value={formData.IGSTCode}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stock</label>
          <Input
            type="text"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sale Price</label>
          <Input
            type="text"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price</label>
          <Input
            type="text"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full"
            placeholder="0.00"
          />
        </div>
      </div>

    </div>
  );
};

export default ItemId;
