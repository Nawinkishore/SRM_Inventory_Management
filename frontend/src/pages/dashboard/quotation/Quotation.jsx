import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BlobProvider } from "@react-pdf/renderer";
import { useGetQuotations, useSearchQuotations } from "@/features/quotation/useQuotation";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Eye, 
  Printer, 
  Download, 
  Plus, 
  FileText, 
  Calendar,
  User,
  Hash,
  Search,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import QuotationPDF from "./QuotationPDF";

const Quotation = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when searching
      if (searchQuery) {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use search hook when there's a search query, otherwise use normal pagination
  const { data: searchData, isLoading: isSearchLoading } = useSearchQuotations(debouncedSearch);
  const { data: paginatedData, isLoading: isPaginatedLoading } = useGetQuotations(page, limit);

  // Determine which data to use
  const isSearching = debouncedSearch.length > 0;
  const data = isSearching ? searchData : paginatedData;
  const isLoading = isSearching ? isSearchLoading : isPaginatedLoading;

  const quotations = data?.data || [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quotations
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage and track all your quotations
            </p>
          </div>
          <Link to="/dashboard/quotation/add">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Quotation
            </Button>
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Quotations</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {pagination?.totalDocs || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">
                    {isSearching ? "Search Results" : "This Page"}
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {quotations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Hash className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Page</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {isSearching ? "Search" : `${page} / ${totalPages}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH & FILTER */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by quotation number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isSearching && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Search
                </Button>
              )}
            </div>
            {isSearching && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Searching for: "{debouncedSearch}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileText className="w-5 h-5 text-blue-600" />
              {isSearching ? "Search Results" : "Quotation List"}
              {quotations.length > 0 && (
                <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {quotations.length} {quotations.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">
                  {isSearching ? "Searching quotations..." : "Loading quotations..."}
                </p>
              </div>
            ) : quotations.length === 0 ? (
              <div className="text-center py-12 bg-slate-50">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  {isSearching 
                    ? `No quotations found for "${debouncedSearch}"` 
                    : "No quotations found"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {isSearching 
                    ? "Try searching with a different term" 
                    : "Create your first quotation to get started"}
                </p>
                {isSearching && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="mt-4 gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Sr No.
                        </div>
                      </TableHead>
                      <TableHead className="font-bold">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Quotation Number
                        </div>
                      </TableHead>
                      <TableHead className="font-bold">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Customer Name
                        </div>
                      </TableHead>
                      <TableHead className="font-bold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {quotations.map((quotation, index) => (
                      <TableRow key={quotation._id} className="hover:bg-blue-50/50">
                        <TableCell className="font-medium text-slate-600">
                          {isSearching ? index + 1 : (page - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {quotation.quotationNumber}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          {quotation.customer.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(quotation.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link to={`/dashboard/quotation/view/${quotation._id}`}>
                              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                              </button>
                            </Link>

                            <BlobProvider
                              document={<QuotationPDF quotation={quotation} />}
                            >
                              {({ url }) => (
                                <button
                                  onClick={() => url && window.open(url)}
                                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors group"
                                >
                                  <Printer className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                </button>
                              )}
                            </BlobProvider>

                            <BlobProvider
                              document={<QuotationPDF quotation={quotation} />}
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
                                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                                >
                                  <Download className="w-4 h-4 text-slate-400 group-hover:text-green-600 transition-colors" />
                                </button>
                              )}
                            </BlobProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAGINATION - Only show when not searching */}
        {!isSearching && totalPages > 1 && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={`cursor-pointer ${
                        page === 1 ? "pointer-events-none opacity-50" : "hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={page === pageNum}
                            onClick={() => setPage(pageNum)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <PaginationItem key={i}>
                          <span className="px-2 text-slate-400">...</span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      className={`cursor-pointer ${
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-3 text-sm text-slate-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, pagination?.totalDocs || 0)} of{" "}
                {pagination?.totalDocs || 0} quotations
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quotation;