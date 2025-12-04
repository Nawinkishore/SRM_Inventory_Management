import React from "react";
import { useCreateInvoice } from "@/features/invoice/useInvoice";
import { useProductSearch } from "@/features/products/useProduct";

import { Input } from "@/components/ui/input";
import { FileText, User, Package, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

/* --- Table shadcn wrapper --- */
const Table = ({ children, ...props }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props}>
      {children}
    </table>
  </div>
);
const TableHeader = ({ children }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);
const TableBody = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);
const TableHead = ({ children }) => (
  <th className="h-12 px-4 text-left font-medium text-muted-foreground">
    {children}
  </th>
);
const TableRow = ({ children }) => (
  <tr className="border-b hover:bg-muted/50 transition-colors">{children}</tr>
);
const TableCell = ({ children }) => (
  <td className="p-4 align-middle">{children}</td>
);

/* PRODUCT CONFIG */
const PRODUCT_TABLE_CONFIG = [
  { key: "partNo", label: "Part No" },
  { key: "partName", label: "Name" },
  { key: "largeGroup", label: "Group" },
];

/* Convert DB product to quotation item */
const convertProduct = (p) => ({
  partNo: p.partNo,
  partName: p.partName,
  largeGroup: p.largeGroup,
  tariff: Number(p.tariff) || 0,
  revisedMRP: Number(p.revisedMRP) || 0,
  CGSTCode: Number(p.CGSTCode) || 0,
  SGSTCode: Number(p.SGSTCode) || 0,
  IGSTCode: Number(p.IGSTCode) || 0,
  quantity: 1,
  discount: 0,
  taxAmount: 0,
  finalAmount: Number(p.revisedMRP) || 0,
});

const QuotationPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  const [customer, setCustomer] = React.useState({
    name: "",
    phone: "",
  });

  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  const { data: products = [] } = useProductSearch(search);

  /* ---------- Prevent Duplicate ---------- */
  const addItem = (p) => {
    if (items.some((i) => i.partNo === p.partNo)) {
      toast.error("Item already added!");
      return;
    }
    setItems((prev) => [...prev, convertProduct(p)]);
  };

  /* ---------- Qty Input with Auto Calculation ---------- */
  const updateQty = (index, value) => {
    setItems((list) =>
      list.map((item, i) => {
        if (i !== index) return item;

        // Parse the input value using Number() instead of parseInt()
        const qtyNum = Number(value);
        const validQty = isNaN(qtyNum) || qtyNum < 1 ? 1 : qtyNum;

        // Auto-calculate finalAmount based on quantity
        return {
          ...item,
          quantity: validQty,
          finalAmount: validQty * item.revisedMRP,
        };
      })
    );
  };

  /* ---------- Final Amount Input ---------- */
  const updateAmount = (index, value) => {
    const numValue = Number(value);
    const validAmount = isNaN(numValue) || numValue < 0 ? 0 : numValue;

    setItems((list) =>
      list.map((item, i) =>
        i === index ? { ...item, finalAmount: validAmount } : item
      )
    );
  };

  /* ---------- Delete Item ---------- */
  const deleteItem = (index) => {
    setItems((list) => list.filter((_, i) => i !== index));
  };

  /* ---------- Totals ---------- */
  const subTotal = items.reduce(
    (sum, item) => sum + (Number(item.finalAmount) || 0),
    0
  );

  const grandTotal = subTotal;
  const roundOff = Math.round(grandTotal) - grandTotal;

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    if (!customer.name) return toast.error("Customer name required");
    if (items.length === 0) return toast.error("Add at least 1 item");

    // Validate all items
    for (let i of items) {
      const qtyNum = Number(i.quantity);
      const amtNum = Number(i.finalAmount);

      if (isNaN(qtyNum) || qtyNum < 1) {
        toast.error(`Invalid quantity for item: ${i.partName}`);
        return;
      }

      if (isNaN(amtNum)) {
        toast.error(`Invalid final amount for item: ${i.partName}`);
        return;
      }
    }

    // Clean items before sending - ensure all numbers are valid
    const cleanItems = items.map((it) => ({
      partNo: it.partNo || "",
      partName: it.partName || "",
      largeGroup: it.largeGroup || "",
      tariff: Number(it.tariff) || 0,
      revisedMRP: Number(it.revisedMRP) || 0,
      CGSTCode: Number(it.CGSTCode) || 0,
      SGSTCode: Number(it.SGSTCode) || 0,
      IGSTCode: Number(it.IGSTCode) || 0,
      quantity: (() => {
        const q = Number(it.quantity);
        return isNaN(q) || q < 1 ? 1 : q;
      })(),
      discount: Number(it.discount) || 0,
      taxAmount: Number(it.taxAmount) || 0,
      finalAmount: (() => {
        const a = Number(it.finalAmount);
        return isNaN(a) ? 0 : a;
      })(),
    }));

    const cleanSubTotal = cleanItems.reduce(
      (sum, it) => sum + it.finalAmount,
      0
    );

    const payload = {
      invoiceType: "quotation",
      invoiceNumber: null,
      invoiceStatus: "draft",
      invoiceDate: today,
      customer,
      vehicle: {
        model: "",
        registrationNumber: "",
        vin: "",
        kmReading: 0,
        nextServiceKm: 0,
        nextServiceDate: null,
      },
      remarks,
      items: cleanItems,
      amountType: "cash",
      totals: {
        subTotal: Number(cleanSubTotal.toFixed(2)),
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: Number(cleanSubTotal.toFixed(2)),
        roundOff: Number(roundOff.toFixed(2)),
      },
      amountPaid: 0,
      balanceDue: 0,
    };

    createInvoice(payload, {
      onSuccess: () => {
        toast.success("Quotation Saved");
        setCustomer({ name: "", phone: "" });
        setItems([]);
        setSearch("");
        setRemarks("");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Error"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Create Quotation
              </h1>
              <p className="text-sm text-slate-500">
                Generate quotation for customer
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <div className="flex gap-2 items-center mb-4">
            <User className="text-blue-500" size={20} />
            <h2 className="font-semibold text-lg">Customer Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Customer Name *"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <div className="flex gap-2 items-center mb-3">
            <Package className="text-blue-500" size={20} />
            <h2 className="font-semibold text-lg">Add Items</h2>
          </div>

          <div className="relative">
            <Input
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && products.length > 0 && (
              <div className="absolute w-full bg-white border rounded shadow max-h-64 overflow-auto mt-2 z-50">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 border-b cursor-pointer hover:bg-slate-50"
                    onClick={() => {
                      addItem(p);
                      setSearch("");
                    }}
                  >
                    <p className="font-medium">{p.partName}</p>
                    <div className="text-sm flex gap-2">
                      <span>{p.partNo}</span>
                      <span className="font-semibold text-blue-600">
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
          <div className="bg-white p-5 rounded-xl shadow border">
            <Table>
              <TableHeader>
                <TableRow>
                  {PRODUCT_TABLE_CONFIG.map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    {PRODUCT_TABLE_CONFIG.map((c) => (
                      <TableCell key={c.key}>{item[c.key] || "-"}</TableCell>
                    ))}

                    {/* Unit Price (Read-only) */}
                    <TableCell>
                      <span className="text-slate-600 font-medium">
                        ₹{Number(item.revisedMRP).toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Qty Input - Auto calculates finalAmount */}
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(idx, e.target.value)}
                        className="w-20"
                      />
                    </TableCell>

                    {/* Final Amount Input - Manual override possible */}
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        readOnly={true}
                        value={item.finalAmount}
                        onChange={(e) => updateAmount(idx, e.target.value)}
                        className="w-28 font-semibold"
                      />
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => deleteItem(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary */}
            <div className="flex justify-end mt-5">
              <div className="w-80 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{subTotal.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-slate-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">
                      Grand Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <h3 className="font-semibold mb-3 text-slate-800">Remarks</h3>
          <Input
            placeholder="Type notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <button
            disabled={isPending}
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isPending ? "Saving..." : "Save Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationPage;