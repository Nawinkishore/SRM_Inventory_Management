import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useProductSearch } from "@/features/products/useProduct";
import {
  useDeleteQuotationById,
  useGetQuotationById,
  useUpdateQuotationbyId,
} from "@/features/quotation/useQuotation";
import { 
  ChevronLeft, 
  Trash, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  Package, 
  Search,
  DollarSign,
  AlertCircle,
  Trash2
} from "lucide-react";
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetQuotationById(id);
  const { mutate: updateQuotation } = useUpdateQuotationbyId();
  const { mutate: deleteQuotation } = useDeleteQuotationById();
  const [isEditing, setIsEditing] = React.useState(false);

  const [items, setItems] = React.useState([]);
  const [customer, setCustomer] = React.useState({ name: "", phone: "" });
  const [date, setDate] = React.useState("");

  useEffect(() => {
    if (data?.data?.items) setItems(data.data.items);
    if (data?.data?.customer) setCustomer(data.data.customer);
    if (data?.data?.date)
      setDate(new Date(data.data.date).toISOString().split("T")[0]);
  }, [data]);
 
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const delay = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(delay);
  }, [query]);

  const { data: fetchedProducts } = useProductSearch(debouncedQuery);

  // ADD ITEM
  const handleAddItems = (product) => {
    const exists = items.find((item) => item.partNo === product.partNo);
    if (exists) return toast.error("Item already added");

    setItems([
      ...items,
      {
        partName: product.partName,
        partNo: product.partNo,
        quantity: 1,
        MRP: product.revisedMRP,
      },
    ]);

    setQuery("");
  };

  // UPDATE ITEM
  const updateItems = (index, field, value) => {
    const updated = [...items];

    if (field === "quantity") {
      updated[index].quantity = value === "" ? "" : Number(value);
    } else if (field === "MRP") {
      updated[index].MRP = value === "" ? 0 : Number(value);
    }

    setItems(updated);
  };

  // DELETE ITEM
  const handleRemove = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSaveChanges = () => {
    const payload = {
      date,
      customer,
      items,
      totalAmount: items.reduce(
        (total, item) => total + item.quantity * item.MRP,
        0
      ),
    };
    updateQuotation(
      { id, payload },
      {
        onSuccess: () => {
          toast.success("Quotation updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update quotation: ${error.message}`);
        },
      }
    );
  };

  const itemMrpCalculation = (item) => {
    return item.quantity * item.MRP;
  };

  const handleDeleteQuotation = (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      deleteQuotation(id, {
        onSuccess: () => {
          toast.success("Quotation deleted successfully");
          navigate("/dashboard/quotation");
        },
        onError: (error) => {
          toast.error(`Failed to delete quotation: ${error.message}`);
        },
      });
    }
  };

  const totalAmount = items.reduce(
    (total, item) => total + itemMrpCalculation(item),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/quotation">
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Quotation Details</h1>
              <p className="text-sm text-slate-600">View and manage quotation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => {
                if (isEditing) {
                  handleSaveChanges();
                }
                setIsEditing(!isEditing);
              }}
              className={`flex-1 sm:flex-none gap-2 ${
                isEditing 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" /> Edit
                </>
              )}
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
                onClick={() => {
                  toast.info("Changes cancelled");
                  setIsEditing(false);
                  if (data?.data?.items) setItems(data.data.items);
                  if (data?.data?.customer) setCustomer(data.data.customer);
                }}
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading quotation...</p>
            </div>
          </Card>
        ) : isError ? (
          <Card className="p-12 border-red-200 bg-red-50">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Error: {error.message}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* QUOTATION INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QUOTATION DETAILS */}
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Quotation Details
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3" />
                      Quotation Number
                    </label>
                    <Input 
                      value={data?.data?.quotationNumber} 
                      readOnly 
                      className="bg-slate-50 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CUSTOMER DETAILS */}
              <Card className="shadow-sm border-l-4 border-l-purple-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <User className="w-5 h-5 text-purple-600" />
                    Customer Details
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" />
                      Customer Name
                    </label>
                    <Input
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="Enter customer name"
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <Input
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEARCH PRODUCTS */}
            {isEditing && (
              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Search className="w-5 h-5 text-green-600" />
                    Search & Add Items
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search products by name or part number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {query && (
                      <div className="absolute left-0 w-full mt-2 rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto z-10">
                        {fetchedProducts?.length ? (
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
            )}

            {/* ITEMS TABLE */}
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Package className="w-5 h-5 text-orange-600" />
                    Items List
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
                    <p className="text-slate-600 font-medium">No items added</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {isEditing ? "Search and add products to get started" : "This quotation has no items"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-bold">S.No</TableHead>
                          <TableHead className="font-bold">Part Name</TableHead>
                          <TableHead className="font-bold">Part No</TableHead>
                          <TableHead className="font-bold">Quantity</TableHead>
                          <TableHead className="font-bold">Unit Price</TableHead>
                          <TableHead className="font-bold">MRP</TableHead>
                          {isEditing && <TableHead className="font-bold text-center">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.partName}</TableCell>
                            <TableCell>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                {item.partNo}
                              </span>
                            </TableCell>

                            <TableCell>
                              <Input
                                className="max-w-20 text-center font-semibold"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItems(
                                    index,
                                    "quantity",
                                    e.target.value.replace(/[^\d.]/g, "")
                                  )
                                }
                                disabled={!isEditing}
                              />
                            </TableCell>

                            <TableCell className="font-semibold">
                              <Input
                                className="max-w-20 text-center font-semibold"
                                value={item.MRP}
                                onChange={(e) =>
                                  updateItems(
                                    index,
                                    "MRP",
                                    e.target.value.replace(/[^\d.]/g, "")
                                  )
                                }
                                disabled={!isEditing}
                              />
                            </TableCell>

                            <TableCell className="font-bold text-green-600">
                              ₹{itemMrpCalculation(item).toLocaleString('en-IN')}
                            </TableCell>

                            {isEditing && (
                              <TableCell className="text-center">
                                <button
                                  onClick={() => handleRemove(index)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                >
                                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                                </button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TOTAL AMOUNT */}
            <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Total Amount</p>
                      <p className="text-3xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Items Count</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DELETE BUTTON */}
            <Card className="shadow-sm border-2 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Danger Zone</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Once you delete this quotation, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 gap-2 w-full sm:w-auto"
                    onClick={() => handleDeleteQuotation(id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Quotation
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

export default ViewQuotation;