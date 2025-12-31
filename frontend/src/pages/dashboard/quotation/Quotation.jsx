import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useGetQuotations } from "@/features/quotation/useQuotation";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Printer, Trash, View } from "lucide-react";

const Quotation = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useGetQuotations(page, limit);

  const quotations = data?.data || [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">Quotation</h1>

        <Link to="/dashboard/quotation/add">
          <Button>Add Quotation</Button>
        </Link>
      </div>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="border rounded-md p-4">
            {quotations.length === 0 ? (
              <p>No quotations found.</p>
            ) : (
              quotations.map((q) => (
                <div key={q._id} className="border-b py-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr No.</TableHead>
                        <TableHead>Quotation Number</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((quotation, index) => (
                        <TableRow key={quotation._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{quotation.quotationNumber}</TableCell>
                          <TableCell>{quotation.customer.name}</TableCell>
                          <TableCell>
                            {new Date(quotation.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex ">
                              <Link to={`/dashboard/quotation/view/${quotation._id}`}>
                                <Eye
                                  size={20}
                                  className="cursor-pointer mr-4 hover:scale-110 hover:text-blue-500"
                                />
                              </Link>
                              <Printer
                                size={20}
                                className="cursor-pointer  hover:scale-110 hover:text-blue-500"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>

          {/* SHADCN PAGINATION */}
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Page Numbers */}
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

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setPage(page + 1)}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default Quotation;
