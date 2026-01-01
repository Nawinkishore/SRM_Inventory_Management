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
import { BlobProvider } from "@react-pdf/renderer";

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
import { Eye, Printer, Trash, View, Download } from "lucide-react";
import QuotationPDF from "./QuotationPDF";

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
              <div className="border rounded-md p-4">
                {quotations.length === 0 ? (
                  <p>No quotations found.</p>
                ) : (
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
                      {quotations.map((quotation, index) => (
                        <TableRow key={quotation._id}>
                          <TableCell>
                            {(page - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell>{quotation.quotationNumber}</TableCell>
                          <TableCell>{quotation.customer.name}</TableCell>

                          <TableCell>
                            {new Date(quotation.date).toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/dashboard/quotation/view/${quotation._id}`}
                              >
                                <Eye className="cursor-pointer hover:text-blue-500"  size={16}/>
                              </Link>

                              <BlobProvider
                                document={
                                  <QuotationPDF quotation={quotation} />
                                }
                              >
                                {({ url }) => (
                                  <button
                                    onClick={() => url && window.open(url)}
                                  >
                                    <Printer 
                                    size={16}
                                    className="text-black hover:cursor-pointer hover:text-blue-500 hover:scale-110"
                                    
                                    />
                                  </button>
                                )}
                              </BlobProvider>

                              <BlobProvider
                                document={
                                  <QuotationPDF quotation={quotation} />
                                }
                              >
                                {({ url }) => (
                                  <button
                                    onClick={() => {
                                      if (!url) return;
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = `Quotation-${quotation.quotationNumber}.pdf`;
                                      a.click();
                                    }}
                                  >
                                    <Download size={16}
                                    className="text-black hover:cursor-pointer hover:text-blue-500 hover:scale-110"
                                    />
                                  </button>
                                )}
                              </BlobProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
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
