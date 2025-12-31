import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { Card } from "@/components/ui/card";
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

const AddQuotation = () => {
  const { mutate: addQuotation } = useAddQuotation();

  const [quotationNumber, setQuotationNumber] = React.useState("");
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
      quotationNumber: quotationNumber,
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
    if (!quotationNumber.trim()) {
      toast.error("Quotation Number is required");
      return;
    }
    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Customer details are required");
      return;
    }
    if (items.length === 0) {
      toast.error("At least one item must be added");
      return;
    }
    const payload = generateQuotationPayload();
    try {
      addQuotation(payload, {
        onSuccess: () => {
          toast.success("Quotation added successfully");
          setQuotationNumber("");
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
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/dashboard/quotation">
          <Button variant="outline">
            <ChevronLeft className="mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-bold text-xl">Add Quotation</h1>
      </div>

      {/* Quotation Details */}
      <Card className="p-5 space-y-4">
        <strong className="text-base">Quotation Details</strong>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Quotation Number"
            value={quotationNumber}
            onChange={(e) => setQuotationNumber(e.target.value)}
          />
          <Input
            placeholder="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Customer */}
      <Card className="p-5 space-y-4">
        <strong className="text-base">Customer Details</strong>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Customer Name"
            value={customerDetails.name}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, name: e.target.value })
            }
          />
          <Input
            placeholder="Customer Phone"
            value={customerDetails.phone}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, phone: e.target.value })
            }
          />
        </div>
      </Card>

      {/* Search */}
      <Card className="p-5 space-y-3">
        <strong className="text-base">Search Item</strong>

        <div className="relative">
          <Input
            type="text"
            placeholder="Search Products"
            className="w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <div className="absolute left-0 w-full mt-1 rounded-md border bg-white shadow-md max-h-40 overflow-y-auto z-10">
              {isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
              ) : fetchedProducts?.length ? (
                fetchedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between "
                    onClick={() => handleAddItems(product)}
                  >
                    <div>
                      <p>{product.partName}</p>
                      <strong>{product.partNo}</strong>
                    </div>
                    <div>
                      <label
                        htmlFor="price"
                        className="font-bold text-green-500"
                      >
                        MRP
                      </label>
                      <p>₹{product.revisedMRP}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      <Card className="p-5 space-y-3">
        <strong className="text-base">Items Table</strong>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items added yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr No.</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Part No</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.partName}</TableCell>
                  <TableCell>{item.partNo}</TableCell>
                  <TableCell>
                    <Input
                      value={item.quantity}
                      className={"max-w-20"}
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
                  <TableCell>
                    <Input
                      value={itemFinalAmount(item)}
                      className={"max-w-20"}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, "");
                        updateItems(index, "revisedMRP", value);
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, "");
                        updateItems(index, "revisedMRP", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Trash
                      size={20}
                      className="ml-5 text-red-500 hover:scale-110 cursor-pointer"
                      onClick={() => handleDeleteItem(index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      {items.length > 0 && (
        <div className="flex items-center justify-between mt-3">
          <Button className="mr-5" onClick={handleSaveQuotation}>
            Save Quotation
          </Button>
          <strong className="text-lg">
            Total Amount: ₹{totalAmount(items)}
          </strong>
        </div>
      )}
    </section>
  );
};

export default AddQuotation;
