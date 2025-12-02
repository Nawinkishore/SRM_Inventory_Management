import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";

const configureColumns = [
  {
    key: "itemNumber",
    label: "Item Number",
    name: "item-number",
    placeholder: "Enter Item Number",
  },
  { key: "quantity", label: "Qty", name: "quantity", placeholder: "Qty" },
  { key: "price", label: "Price", name: "price", placeholder: "₹ Price" },
  { key: "total", label: "Total", name: "total", placeholder: "₹ Total" },
];

const AddStockPage = () => {
  const [rows, setRows] = useState([
    { itemNumber: "", quantity: "", price: "", total: "" },
  ]);
  const [orderName, setOrderName] = useState("");
  const date = new Date().toLocaleDateString();

  const handleChange = (index, field, value) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      updated[index][field] = value;

      if (field === "quantity" || field === "price") {
        const qty = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(updated[index].price) || 0;
        updated[index].total = qty * price;
      }
      return updated;
    });
  };

  const addRows = () =>
    setRows((prev) => [
      ...prev,
      { itemNumber: "", quantity: "", price: "", total: "" },
    ]);

  const removeRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Back Btn + Order Info */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        {/* Back */}
        <Link to="/dashboard/purchase">
          <Button variant="outline" className="w-full sm:w-auto text-sm">
            ← Back
          </Button>
        </Link>

        {/* Inputs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-end w-full sm:w-auto">
          <input
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            type="text"
            placeholder="Order Name"
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-52
                   focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={date}
            readOnly
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-40
                   bg-gray-100 font-medium text-gray-700"
          />
        </div>
      </div>

      {/* Wrapper */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
          Add Stock Items
        </h2>

        {/* TABLE VIEW - Desktop & Tablet */}
        <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
          <div className="min-w-[700px]">
            <Table>
              <TableCaption className="text-gray-500 mb-2">
                Add your stock items
              </TableCaption>

              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  {configureColumns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="text-center whitespace-nowrap text-sm"
                    >
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-center text-sm font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-gray-50">
                    {configureColumns.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <input
                          type="text"
                          name={col.name}
                          placeholder={col.placeholder}
                          value={row[col.key]}
                          onChange={(e) =>
                            handleChange(rowIndex, col.key, e.target.value)
                          }
                          readOnly={col.key === "total"}
                          className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2
                        ${
                          col.key === "total"
                            ? "bg-gray-100 font-semibold text-gray-600"
                            : ""
                        }
                      `}
                        />
                      </TableCell>
                    ))}

                    <TableCell className="text-center">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-2 rounded-md bg-red-500 hover:bg-red-600 text-white 
                               transition whitespace-nowrap"
                      >
                        <Trash size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* MOBILE VIEW - CARD MODE */}
        <div className="md:hidden space-y-4 mt-3">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              {configureColumns.map((col) => (
                <div key={col.key} className="mb-3">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    {col.label}
                  </label>

                  <input
                    type="text"
                    name={col.name}
                    placeholder={col.placeholder}
                    value={row[col.key]}
                    onChange={(e) =>
                      handleChange(rowIndex, col.key, e.target.value)
                    }
                    readOnly={col.key === "total"}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2
                  ${
                    col.key === "total"
                      ? "bg-gray-200 font-semibold text-gray-600"
                      : ""
                  }
                `}
                  />
                </div>
              ))}

              {/* Delete Button full width */}
              <button
                onClick={() => removeRow(rowIndex)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-red-500 
                       hover:bg-red-600 text-white rounded-md transition text-sm"
              >
                <Trash size={14} />
                Remove Row
              </button>
            </div>
          ))}
        </div>

        {/* Add Buttons */}
        <div className="flex justify-center mt-6">
          <button
            onClick={addRows}
            className="md:hidden w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700
                   text-white flex items-center justify-center shadow-lg transition"
          >
            <Plus />
          </button>

          <button
            onClick={addRows}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                   text-white px-4 py-2 rounded-md shadow-md transition"
          >
            <Plus size={18} /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockPage;
