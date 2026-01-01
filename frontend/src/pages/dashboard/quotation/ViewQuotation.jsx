import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
import { ChevronLeft, Trash } from "lucide-react";
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
  console.log(data?.data);
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
  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/dashboard/quotation">
          <Button>
            <ChevronLeft /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (isEditing) {
                handleSaveChanges();
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
          {isEditing && (
            <Button
              variant="destructive"
              onClick={() => {
                toast.info("Changes cancelled");
                setIsEditing(false);
                if (data?.data?.items) setItems(data.data.items);
                if (data?.data?.customer) setCustomer(data.data.customer);
              }}
            >
              Cancel Changes
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          {/* QUOTATION DETAILS */}
          <Card className="mt-5">
            <CardHeader className="font-bold">Quotation Details</CardHeader>
            <div className="flex px-5 gap-2">
              <Input value={data?.data?.quotationNumber} readOnly />
              <Input type="date" value={date} disabled={!isEditing} />
            </div>
          </Card>

          {/* CUSTOMER */}
          <Card className="mt-5">
            <CardHeader className="font-bold">Customer Details</CardHeader>
            <div className="flex px-5 gap-2">
              <Input
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                disabled={!isEditing}
              />
              <Input
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </Card>

          {/* SEARCH */}
          <Card className="p-5 space-y-3 mt-5">
            <strong>Search Item</strong>

            <div className="relative">
              <Input
                placeholder="Search Products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!isEditing}
              />

              {query && (
                <div className="absolute left-0 w-full mt-1 rounded-md border bg-white shadow-md max-h-40 overflow-y-auto z-10">
                  {fetchedProducts?.length ? (
                    fetchedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        onClick={() => handleAddItems(product)}
                      >
                        <div>
                          <p>{product.partName}</p>
                          <strong>{product.partNo}</strong>
                        </div>
                        <div>
                          <label className="font-bold text-green-500">
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

          {/* ITEMS */}
          <Card className="mt-5">
            <CardHeader className="font-bold">Items Details</CardHeader>

            <div className="px-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part No</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.partName}</TableCell>
                      <TableCell>{item.partNo}</TableCell>

                      <TableCell>
                        <Input
                          className="max-w-20"
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

                      <TableCell>
                        <Input
                          className="max-w-20"
                          value={itemMrpCalculation(item)}
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

                      <TableCell>
                        <Trash
                          size={20}
                          className={`hover:scale-105 ${
                            isEditing
                              ? "hover:text-blue-500 cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (!isEditing) return;
                            handleRemove(index);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          <div className="mt-5 text-right">
            <strong>
              Total MRP: ₹
              {items.reduce(
                (total, item) => total + itemMrpCalculation(item),
                0
              )}
            </strong>
          </div>
          <div>
            <Button
              className={"w-full mt-5 hover:bg-red-500"}
              onClick={() => {
                handleDeleteQuotation(id);
              }}
            >
              Delete Quotation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewQuotation;
