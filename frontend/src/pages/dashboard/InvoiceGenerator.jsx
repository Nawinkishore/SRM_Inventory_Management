import React from "react";
import {
  useNextInvoiceNumber,
  useCreateInvoice,
} from "@/features/invoice/useInvoice";
import { useProductSearch } from "@/features/products/useProduct";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Table components imported from shadcn/ui
const Table = ({ children, ...props }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
);

const TableHead = ({ children, ...props }) => (
  <th
    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
    {...props}
  >
    {children}
  </th>
);

const TableRow = ({ children, ...props }) => (
  <tr
    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    {...props}
  >
    {children}
  </tr>
);

const TableCell = ({ children, ...props }) => (
  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0" {...props}>
    {children}
  </td>
);

import { Trash2, FileText, User, Car, Package, Save } from "lucide-react";
import { toast } from "sonner";

const invoiceTypes = ["job-card", "sales", "advance"];
const invoiceStatusOptions = ["draft", "completed"];

const PRODUCT_TABLE_CONFIG = [
  { key: "partNo", label: "Part No" },
  { key: "partName", label: "Part Name" },
  { key: "largeGroup", label: "Group" },
  { key: "tariff", label: "Tariff" },
  { key: "revisedMRP", label: "Price (MRP)" },
  { key: "CGSTCode", label: "CGST %" },
  { key: "SGSTCode", label: "SGST %" },
  { key: "IGSTCode", label: "IGST %" },
];

// convert product model → invoice item
const convertProductToItem = (product) => ({
  partNo: product.partNo,
  partName: product.partName,
  largeGroup: product.largeGroup,
  tariff: product.tariff,
  revisedMRP: product.revisedMRP,
  CGSTCode: product.CGSTCode,
  SGSTCode: product.SGSTCode,
  IGSTCode: product.IGSTCode,

  quantity: 1,
  discount: 0,
  taxAmount: 0,
  finalAmount: product.revisedMRP || 0,
});

const InvoiceGenerator = () => {
  const today = new Date().toISOString().split("T")[0];
  const { data: nextInvoiceNumber = "" } = useNextInvoiceNumber();
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // FORM STATES
  const [invoiceType, setInvoiceType] = React.useState("");
  const [invoiceStatus, setInvoiceStatus] = React.useState("draft");

  const [customer, setCustomer] = React.useState({
    name: "",
    phone: "",
  });

  const [vehicle, setVehicle] = React.useState({
    model: "",
    registrationNumber: "",
    vin: "",
    kmReading: "",
    nextServiceKm: "",
    nextServiceDate: "",
  });

  const [remarks, setRemarks] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState("");

  const { data: products = [] } = useProductSearch(search);

  /* UPDATE QTY */
  const updateItemQty = (index, qty) => {
    setItems((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: qty < 1 ? 1 : qty,
              finalAmount: (qty < 1 ? 1 : qty) * item.revisedMRP,
            }
          : item
      )
    );
  };

  /* DELETE ITEM */
  const deleteItem = (index) =>
    setItems((items) => items.filter((_, i) => i !== index));

  /* TOTAL CALC */
  /* TOTAL CALC UPDATED */
  const subtotal = items.reduce((sum, i) => {
    return sum + i.revisedMRP * i.quantity;
  }, 0);

  const totalGSTAmount = items.reduce((sum, item) => {
    const gstPercent =
      item.IGSTCode > 0
        ? item.IGSTCode
        : (item.CGSTCode || 0) + (item.SGSTCode || 0);

    const base = item.revisedMRP / (1 + gstPercent / 100);
    const perUnitGst = item.revisedMRP - base;

    return sum + perUnitGst * item.quantity;
  }, 0);
   

  const grandTotal = subtotal + totalGSTAmount;
  const roundOff = Number((Math.round(grandTotal) - grandTotal).toFixed(2));
  const [balanceDue, setBalanceDue] = React.useState("");

  const safeBalanceDue = Number(
  Math.min(parseFloat(balanceDue || 0), grandTotal).toFixed(2)
);

const amountPaid = Number(
  (grandTotal - safeBalanceDue).toFixed(2)
);


  /* SAVE INVOICE */
  const handleSave = () => {
    if (!invoiceType) return alert("Select invoice type");
    if (!customer.name) return alert("Customer name required");
    if (items.length === 0) return alert("Add at least 1 item");

    const invoiceData = {
      invoiceNumber: invoiceType !== "quotation" ? nextInvoiceNumber : null,
      invoiceType,
      invoiceStatus,
      invoiceDate: today,
      customer,
      vehicle,
      remarks,
      items,
      totals: {
        subTotal: Number(subtotal.toFixed(2)),
        totalDiscount: 0,
        totalTax: Number(totalGSTAmount.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
        roundOff: roundOff
      },
      amountPaid,
      balanceDue: safeBalanceDue,
    };

    createInvoice(invoiceData, {
      onSuccess: (data) => {
        toast.success(data.message || "Invoice created");
        setInvoiceType("");
        setInvoiceStatus("draft");
        setCustomer({ name: "", phone: "" });
        setVehicle({
          model: "",
          registrationNumber: "",
          vin: "",
          kmReading: "",
          nextServiceKm: "",
          nextServiceDate: "",
        });
        setRemarks("");
        setItems([]), setBalanceDue("");
        setSearch("");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Error creating invoice"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Invoice Generator
                </h1>
                <p className="text-sm text-slate-500">
                  Create and manage invoices
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Invoice Type */}
              <Select onValueChange={setInvoiceType}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                  <SelectValue placeholder="Invoice Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Invoice Types</SelectLabel>
                    {invoiceTypes.map((invType) => (
                      <SelectItem key={invType} value={invType}>
                        {invType
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Invoice Status */}
              <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                  <SelectValue placeholder="Invoice Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {invoiceStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">
              Customer Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoiceType !== "quotation" && (
              <Input
                placeholder="Invoice number"
                type="text"
                value={nextInvoiceNumber}
                readOnly
                className="bg-slate-50"
              />
            )}

            <Input
              placeholder="Customer Name *"
              type="text"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <Input
              placeholder="Phone Number"
              type="text"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />

            <Input
              placeholder="Date"
              type="date"
              value={today}
              readOnly
              className="bg-slate-50"
            />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Car className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">
              Vehicle Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Vehicle Model"
              type="text"
              value={vehicle.model}
              onChange={(e) =>
                setVehicle({ ...vehicle, model: e.target.value })
              }
            />

            <Input
              placeholder="Registration Number"
              type="text"
              value={vehicle.registrationNumber}
              onChange={(e) =>
                setVehicle({
                  ...vehicle,
                  registrationNumber: e.target.value,
                })
              }
            />

            <Input
              placeholder="VIN (Chassis Number)"
              type="text"
              value={vehicle.vin}
              onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })}
            />

            <Input
              placeholder="KM Reading"
              type="number"
              value={vehicle.kmReading}
              onChange={(e) =>
                setVehicle({ ...vehicle, kmReading: e.target.value })
              }
            />

            <Input
              placeholder="Next Service KM"
              type="number"
              value={vehicle.nextServiceKm}
              onChange={(e) =>
                setVehicle({ ...vehicle, nextServiceKm: e.target.value })
              }
            />

            <Input
              placeholder="Next Service Date"
              type="date"
              value={vehicle.nextServiceDate}
              onChange={(e) =>
                setVehicle({
                  ...vehicle,
                  nextServiceDate: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">
              Add Products
            </h2>
          </div>

          <div className="relative">
            <Input
              placeholder="Search products by name or part number..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />

            {search && products.length > 0 && (
              <div className="absolute w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto mt-2">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 cursor-pointer hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                    onClick={() => {
                      const newItem = convertProductToItem(p);

                      setItems((prev) => {
                        const exists = prev.some(
                          (item) => item.partNo === newItem.partNo
                        );
                        if (exists) return prev;
                        return [...prev, newItem];
                      });

                      setSearch("");
                    }}
                  >
                    <p className="font-medium text-slate-800">{p.partName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">{p.partNo}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{p.revisedMRP}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Invoice Items
            </h3>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      {PRODUCT_TABLE_CONFIG.map((col) => (
                        <TableHead
                          key={col.key}
                          className="font-semibold text-slate-700"
                        >
                          {col.label}
                        </TableHead>
                      ))}
                      <TableHead className="font-semibold text-slate-700">
                        Qty
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Total
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {PRODUCT_TABLE_CONFIG.map((col) => (
                          <TableCell key={col.key} className="text-slate-700">
                            {item[col.key] || "-"}
                          </TableCell>
                        ))}

                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQty(idx, +e.target.value)
                            }
                            className="w-20"
                          />
                        </TableCell>

                        <TableCell className="font-semibold text-slate-800">
                          ₹{item.finalAmount.toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <button
                            onClick={() => deleteItem(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 w-full md:w-[350px] space-y-3 border border-slate-200">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">GST Amount:</span>
                  <span className="font-semibold">
                    ₹{totalGSTAmount.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">
                      Grand Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-lg font-bold text-slate-800">
                    Balance:
                  </span>
                  <Input
                    type="text"
                    value={balanceDue}
                    onChange={(e) => setBalanceDue(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Additional Notes
          </h3>
          <Input
            placeholder="Add any remarks or special instructions..."
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* SAVE BTN */}
        <div className="flex justify-end pb-6">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isPending}
          >
            <Save size={20} />
            {isPending ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
