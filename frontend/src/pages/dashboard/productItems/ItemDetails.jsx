import React, { useRef, useState, useEffect, useMemo } from "react";
import { useInfiniteProducts, useProductStats } from "@/features/products/useProduct";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PackageOpen, Search, TrendingDown, DollarSign, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ItemDetails = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    isFetching 
  } = useInfiniteProducts(30, debouncedSearch);
  
  const { data: statistics, isLoading: statsLoading } = useProductStats();
  
  const observer = useRef();

  const lastItemRef = (node) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  };

  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.products) ?? [];
  }, [data]);

  const navigateToId = (id) => {
    navigate(`/dashboard/productitems/itemId/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Items</p>
              <p className="text-2xl font-bold mt-1">
                {statsLoading ? "..." : statistics?.totalItems.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {statsLoading ? "..." : statistics?.outOfStockItems.toLocaleString()}
              </p>
              {!statsLoading && statistics?.lowStockItems > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  +{statistics.lowStockItems} low stock
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Stock Value</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {statsLoading 
                  ? "..." 
                  : `₹${parseFloat(statistics?.totalStockValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              className="pl-10"
              placeholder="Search products by name or part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isFetching && !isFetchingNextPage && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Results count */}
      {debouncedSearch && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            Found {data?.pages[0]?.totalItems.toLocaleString() || 0} result
            {data?.pages[0]?.totalItems !== 1 ? 's' : ''}
            {searchQuery && ' for "'}{searchQuery}{searchQuery && '"'}
          </p>
          {allProducts.length < (data?.pages[0]?.totalItems || 0) && (
            <p className="text-sm text-gray-500">
              Showing {allProducts.length} of {data?.pages[0]?.totalItems.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Products List */}
      <div className="space-y-2">
        {allProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <PackageOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No products found matching your search" : "No products available"}
            </p>
            {searchQuery && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms
              </p>
            )}
          </Card>
        ) : (
          allProducts.map((prod, index) => {
            const stockValue = parseFloat(prod.stock || 0);
            const isLowStock = stockValue > 0 && stockValue < 10;
            const isLastItem = index === allProducts.length - 1;
            
            return (
              <Card
                key={prod._id}
                ref={isLastItem ? lastItemRef : null}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToId(prod._id)}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-lg">
                      {prod.partName} — {prod.partNo}
                    </p>
                    {isLowStock && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Low Stock
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Sale Price</p>
                      <p className="text-base font-semibold">
                        ₹{parseFloat(prod.salePrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Purchase Price</p>
                      <p className="text-base font-semibold">
                        ₹{parseFloat(prod.purchasePrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">In Stock</p>
                      <p
                        className={`text-base font-semibold ${
                          stockValue === 0 
                            ? "text-red-600" 
                            : isLowStock 
                              ? "text-orange-600" 
                              : "text-green-600"
                        }`}
                      >
                        {stockValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Loading states */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading more products...</p>
        </div>
      )}
      
      {!hasNextPage && allProducts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">
            {debouncedSearch 
              ? "All matching products loaded" 
              : "All products loaded"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;