import React from "react";
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

import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useInvoices } from "@/features/invoice/useInvoice";

const InvoiceList = () => {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const limit = 10;

  const { data, isLoading } = useInvoices({
    page,
    limit,
    search,
    type,
  });

  const invoices = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="p-5 space-y-5">
      <div className="text-center font-bold text-2xl">Invoice List</div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search by Customer Name or Invoice No"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-[280px]"
        />

        <Select
          value={type}
          onValueChange={(v) => {
            setType(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Invoice Types</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="job-card">Job Card</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="quotation">Quotation</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading invoices...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && invoices?.length === 0 && (
        <div className="text-center py-10 text-lg text-muted-foreground">
          No invoices found
        </div>
      )}

      {/* Table */}
      {!isLoading && invoices?.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv._id}>
                  <TableCell>{inv.invoiceNumber || "-"}</TableCell>
                  <TableCell>{inv.customer?.name || "-"}</TableCell>
                  <TableCell>{inv.customer?.phone || "-"}</TableCell>
                  <TableCell className="capitalize">
                    {inv.invoiceType}
                  </TableCell>
                  <TableCell className="capitalize">
                    {inv.invoiceStatus}
                  </TableCell>
                  <TableCell>₹{inv.totals?.grandTotal || 0}</TableCell>
                  <TableCell>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {invoices?.length > 0 && (
        <div className="flex justify-center py-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setPage(page + 1)}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
