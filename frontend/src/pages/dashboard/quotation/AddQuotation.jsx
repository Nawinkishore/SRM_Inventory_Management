import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Trash, 
  Search, 
  User, 
  Phone, 
  Calendar,
  FileText,
  Package,
  Plus,
  DollarSign,
  Trash2,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/features/products/useProduct";
import { useAddQuotation } from "@/features/quotation/useQuotation";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const AddQuotation = () => {
  const { mutate: addQuotation } = useAddQuotation();

  const [date, setDate] = React.useState("");
  const [customerDetails, setCustomerDetails] = React.useState({
    name: "",
    phone: "",
  });

  const [items, setItems] = React.useState([]);

  const [query, setQuery] = React.useState("");

  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const { data: fetchedProducts, isLoading } = useProductSearch(debouncedQuery);

  const itemFinalAmount = (item) => {
    const quantity = item.quantity;
    const MRP = item.revisedMRP;
    return quantity * MRP;
  };

  const totalAmount = (items) => {
    return items.reduce((sum, item) => {
      return sum + itemFinalAmount(item);
    }, 0);
  };

  const handleAddItems = (product) => {
    if (items.find((item) => item._id === product._id)) {
      toast.error("Item already added");
      setQuery("");
      return;
    }
    const newItem = {
      ...product,
      quantity: 1,
    };
    setItems((prevItems) => [...prevItems, newItem]);
    setQuery("");
  };

  const updateItems = (index, field, value) => {
    const updated = [...items];
    if (field === "quantity") {
      updated[index].quantity = value === "" ? "" : Number(value);
    } else if (field === "revisedMRP") {
      updated[index].revisedMRP = value === "" ? 0 : Number(value);
    }
    setItems(updated);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  function generateQuotationPayload() {
    return {
      date: date,
      customer: {
        name: customerDetails.name,
        phone: customerDetails.phone,
      },
      items: items.map((item) => ({
        partName: item.partName,
        partNo: item.partNo,
        quantity: item.quantity,
        MRP: item.revisedMRP,
      })),
      totalAmount: totalAmount(items),
    };
  }

  const handleSaveQuotation = () => {
    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Customer details are required");
      return;
    }
    if (items.length === 0) {
      toast.error("At least one item must be added");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }

    const payload = generateQuotationPayload();
    try {
      addQuotation(payload, {
        onSuccess: () => {
          toast.success("Quotation added successfully");
          setDate("");
          setCustomerDetails({ name: "", phone: "" });
          setItems([]);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to add quotation"
          );
        },
      });
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/quotation">
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Add New Quotation</h1>
              <p className="text-sm text-slate-600">Create a quotation for your customer</p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
              <Calendar className="w-3 h-3" />
              Quotation Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <User className="w-5 h-5 text-purple-600" />
              Customer Details
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                  <User className="w-3 h-3" />
                  Customer Name
                </Label>
                <Input
                  placeholder="Enter customer name"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                  <Phone className="w-3 h-3" />
                  Phone Number
                </Label>
                <Input
                  placeholder="Enter phone number"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEARCH PRODUCTS */}
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Search className="w-5 h-5 text-green-600" />
              Search & Add Products
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products by name or part number..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {query && (
                <div className="absolute left-0 w-full mt-2 rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto z-10">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">Searching...</p>
                    </div>
                  ) : fetchedProducts?.length ? (
                    fetchedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => handleAddItems(product)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{product.partName}</p>
                            <p className="text-xs text-slate-600 font-mono mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
                              {product.partNo}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              MRP
                            </span>
                            <p className="font-bold text-slate-800 mt-1">₹{product.revisedMRP.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ITEMS TABLE */}
        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                Added Items
                <span className="text-xs font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {items.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No items added yet</p>
                <p className="text-sm text-slate-500 mt-1">Search and add products to create quotation</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">Sr No.</TableHead>
                        <TableHead className="font-bold">Part Name</TableHead>
                        <TableHead className="font-bold">Part No</TableHead>
                        <TableHead className="font-bold">Quantity</TableHead>
                        <TableHead className="font-bold">Unit Price</TableHead>
                        <TableHead className="font-bold">Total</TableHead>
                        <TableHead className="font-bold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item._id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.partName}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {item.partNo}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.quantity}
                              className="max-w-20 text-center font-semibold"
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d.]/g, "");
                                updateItems(index, "quantity", value);
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.replace(/[^\d.]/g, "");
                                updateItems(index, "quantity", value);
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(item.revisedMRP).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            ₹{itemFinalAmount(item).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => handleDeleteItem(index)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TOTAL & SAVE BUTTON */}
        {items.length > 0 && (
          <div className="space-y-4">
            {/* Total Amount Card */}
            <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Total Amount</p>
                      <p className="text-3xl font-bold">₹{totalAmount(items).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm opacity-90">Total Items</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="shadow-sm border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Ready to Create Quotation?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Make sure all details are correct before saving
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveQuotation}
                    className="bg-green-600 hover:bg-green-700 gap-2 w-full sm:w-auto text-lg px-8 py-6"
                  >
                    <Plus className="w-5 h-5" />
                    Save Quotation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuotation;