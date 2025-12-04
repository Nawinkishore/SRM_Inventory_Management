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

import {
  Trash2,
  FileText,
  User,
  Car,
  Package,
  Save,
  Wallet,
} from "lucide-react";
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

// product -> invoice item (GST = IGST or (CGST+SGST))
const convertProductToItem = (product) => {
  const price = Number(product.revisedMRP) || 0;
  const qty = 1;

  const gstPercent =
    product.IGSTCode > 0
      ? product.IGSTCode
      : (Number(product.CGSTCode) || 0) + (Number(product.SGSTCode) || 0);

  const itemSubtotal = qty * price;
  const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
  const finalAmount = itemSubtotal + taxAmount;

  return {
    partNo: product.partNo,
    partName: product.partName,
    largeGroup: product.largeGroup,
    tariff: product.tariff,
    revisedMRP: price,
    CGSTCode: product.CGSTCode,
    SGSTCode: product.SGSTCode,
    IGSTCode: product.IGSTCode,
    quantity: qty,
    discount: 0,
    taxAmount,
    finalAmount,
  };
};

const InvoiceGenerator = () => {
  const today = new Date().toISOString().split("T")[0];
  const { data: nextInvoiceNumber = "" } = useNextInvoiceNumber();
  const { mutate: createInvoice, isPending } = useCreateInvoice();

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

  const [paymentMode, setPaymentMode] = React.useState("cash");
  const [amountPaid, setAmountPaid] = React.useState(0);

  const { data: products = [] } = useProductSearch(search);

  const updateItemQty = (index, qty) => {
    const validQty = qty < 1 ? 1 : qty;
    setItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i !== index) return item;

        const itemSubtotal = validQty * item.revisedMRP;
        const gstPercent =
          item.IGSTCode > 0
            ? item.IGSTCode
            : (Number(item.CGSTCode) || 0) + (Number(item.SGSTCode) || 0);

        const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
        const finalAmount = itemSubtotal + taxAmount;

        return {
          ...item,
          quantity: validQty,
          taxAmount,
          finalAmount,
        };
      })
    );
  };

  const deleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.success("Item removed");
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.revisedMRP,
    0
  );
  const totalGSTAmount = items.reduce(
    (sum, item) => sum + (Number(item.taxAmount) || 0),
    0
  );
  const grandTotal = subtotal + totalGSTAmount;

  const balanceAmount = Math.max(0, grandTotal - (amountPaid || 0));

  const handleSave = () => {
    if (!invoiceType) {
      toast.error("Please select invoice type");
      return;
    }
    if (!customer.name) {
      toast.error("Customer name is required");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const invoiceData = {
      invoiceNumber: invoiceType !== "quotation" ? nextInvoiceNumber : null,
      invoiceType,
      invoiceStatus, // backend will override based on balance
      invoiceDate: today,
      customer,
      vehicle,
      remarks,
      items,
      totals: {
        subTotal: subtotal,
        totalDiscount: 0,
        totalTax: totalGSTAmount,
        grandTotal,
        roundOff: 0,
      },
      amountPaid,
      balanceDue: balanceAmount,
      amountType: paymentMode,
    };

    createInvoice(invoiceData, {
      onSuccess: () => {
        toast.success("Invoice created successfully!");
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
        setItems([]);
        setAmountPaid(0);
        setPaymentMode("cash");
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to create invoice"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
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
              <Select value={invoiceType} onValueChange={setInvoiceType}>
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
                          .map(
                            (w) => w.charAt(0).toUpperCase() + w.slice(1)
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Invoice Status (optional manual override) */}
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

        {/* CUSTOMER DETAILS */}
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

        {/* VEHICLE (only for job-card) */}
        {invoiceType !== "sales" && invoiceType !== "advance" && (
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
                onChange={(e) =>
                  setVehicle({ ...vehicle, vin: e.target.value })
                }
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
        )}

        {/* PRODUCT SEARCH */}
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
                        if (exists) {
                          toast.error("Item already added");
                          return prev;
                        }
                        toast.success("Item added");
                        return [...prev, newItem];
                      });
                      setSearch("");
                    }}
                  >
                    <p className="font-medium text-slate-800">{p.partName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        {p.partNo}
                      </span>
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

        {/* ITEMS TABLE */}
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
                        Tax
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
                          <TableCell
                            key={col.key}
                            className="text-slate-700"
                          >
                            {item[col.key] || "-"}
                          </TableCell>
                        ))}

                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQty(idx, Number(e.target.value))
                            }
                            className="w-20"
                          />
                        </TableCell>

                        <TableCell className="text-slate-700">
                          ₹{item.taxAmount.toLocaleString()}
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

            {/* SUMMARY */}
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
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT DETAILS */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="text-blue-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">
                Payment Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* MODE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Mode
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("cash")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      paymentMode === "cash"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("credit")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      paymentMode === "credit"
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Credit
                  </button>
                </div>
              </div>

              {/* AMOUNT PAID + BALANCE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount Paid *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={amountPaid || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isNaN(value)) {
                          setAmountPaid(0);
                          return;
                        }
                        if (value < 0) return;
                        setAmountPaid(Math.min(value, grandTotal));
                      }}
                      placeholder="0"
                      className="text-lg pl-8 font-semibold"
                      min="0"
                      max={grandTotal}
                      step="1"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Grand Total: ₹{grandTotal.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Balance Amount
                  </label>
                  <div
                    className={`flex items-center justify-between h-10 px-4 rounded-lg border-2 text-lg font-bold ${
                      balanceAmount > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-green-50 border-green-300 text-green-700"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {balanceAmount > 0 ? "Due:" : "Paid:"}
                    </span>
                    <span>₹{Math.abs(balanceAmount).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {balanceAmount > 0
                      ? "Remaining balance to be paid"
                      : "Fully paid"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REMARKS */}
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

        {/* SAVE BUTTON */}
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
