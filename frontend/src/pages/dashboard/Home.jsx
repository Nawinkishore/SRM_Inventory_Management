import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useInvoices } from "@/features/invoice/useInvoice";
import { useStockSummary, useItems } from "@/features/items/useItems";

const Home = () => {
  // 🔹 STOCK SUMMARY
  const { data: stockSummary, isLoading: stockLoading } = useStockSummary();

  // 🔹 FETCH ALL INVOICES FOR ACCURATE STATS (high limit)
  const { data: allInvoicesData, isLoading: statsLoading } = useInvoices({
    page: 1,
    limit: 1000, // Fetch all invoices for accurate statistics
    type: "all",
    status: "all",
    search: "",
    customerName: "",
  });

  // 🔹 RECENT INVOICES FOR DISPLAY (limited)
  const { data: recentInvoicesData, isLoading: invoicesLoading } = useInvoices({
    page: 1,
    limit: 10,
    type: "all",
    status: "all",
    search: "",
    customerName: "",
  });

  // 🔹 ALL ITEMS (for stock alerts)
  const { data: itemsData, isLoading: itemsLoading } = useItems({
    page: 1,
    limit: 100,
    q: "",
  });

  // ---- SAFE VALUES WITH NULL CHECKS ----
  // Use all invoices for calculations
  const allInvoices = allInvoicesData?.data ?? [];
  const totalInvoicesCount = allInvoicesData?.meta?.totalDocs ?? 0;

  // Use recent invoices for display
  const recentInvoices = recentInvoicesData?.data ?? [];

  // Calculate completed invoices from ALL invoices
  const completedInvoices = allInvoices.filter(
    (i) => i.invoiceStatus === "completed"
  ).length;

  // Calculate OVERDUE invoices - invoices with balance > 0 and not canceled
  const overdueInvoices = allInvoices.filter(
    (i) => 
      i.invoiceStatus !== "canceled" && 
      i.invoiceStatus !== "completed" &&
      Number(i.balanceDue || 0) > 0
  ).length;

  // Calculate draft invoices (balance > 0 but not formally overdue)
  const draftInvoices = allInvoices.filter(
    (i) => i.invoiceStatus === "draft" && Number(i.balanceDue || 0) > 0
  ).length;

  // Low stock items (stock <= 3)
  const lowStock = itemsData?.data?.filter((item) => Number(item.stock) <= 3) ?? [];

  const stockValue = Number(stockSummary?.stockValue || 0);

  // Revenue calculations with null safety - USING ALL INVOICES
  const totalRevenue = allInvoices
    .filter((i) => i.invoiceStatus === "completed")
    .reduce((sum, inv) => sum + (Number(inv.totals?.grandTotal) || Number(inv.grandTotal) || 0), 0);

  // Total pending = all invoices with balance due (including overdue)
  const totalPending = allInvoices
    .filter((i) => 
      i.invoiceStatus !== "canceled" && 
      Number(i.balanceDue || 0) > 0
    )
    .reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  // Invoice type counts
  const salesInvoices = allInvoices.filter(
    (i) => i.invoiceType?.toLowerCase() === "sales"
  ).length;
  
  const jobCardInvoices = allInvoices.filter(
    (i) => i.invoiceType?.toLowerCase() === "job-card"
  ).length;

  const totalItems = itemsData?.meta?.totalDocs ?? 0;

  // Calculate stats safely
  const avgInvoiceValue = totalInvoicesCount > 0 
    ? Math.round(allInvoices.reduce((sum, inv) => sum + (Number(inv.totals?.grandTotal) || Number(inv.grandTotal) || 0), 0) / totalInvoicesCount)
    : 0;

  const collectionRate = (totalRevenue + totalPending) > 0
    ? Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)
    : 0;

  const successRate = totalInvoicesCount > 0 
    ? Math.round((completedInvoices / totalInvoicesCount) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Track invoices, payments and stock — all in one place.
        </p>
      </div>

      {/* KPI CARDS - ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "..." : `₹${totalRevenue.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">From completed invoices</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? "..." : `₹${totalPending.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">Outstanding balance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stockLoading ? "..." : `₹${stockValue.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">{totalItems} items in inventory</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {itemsLoading ? "..." : lowStock.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI CARDS - ROW 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800">
              {statsLoading ? "..." : totalInvoicesCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {statsLoading ? "..." : salesInvoices}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Job Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {statsLoading ? "..." : jobCardInvoices}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {statsLoading ? "..." : completedInvoices}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">
              {statsLoading ? "..." : draftInvoices}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {statsLoading ? "..." : overdueInvoices}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT INVOICES & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Invoice No</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Balance</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoicesLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  )}

                  {!invoicesLoading && recentInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}

                  {!invoicesLoading && recentInvoices.slice(0, 8).map((inv) => {
                    // Determine if invoice is overdue
                    const isOverdue = inv.invoiceStatus !== "canceled" && 
                                     inv.invoiceStatus !== "completed" && 
                                     Number(inv.balanceDue || 0) > 0;
                    
                    const displayStatus = isOverdue ? "overdue" : inv.invoiceStatus;
                    const grandTotal = Number(inv.totals?.grandTotal) || Number(inv.grandTotal) || 0;

                    return (
                      <TableRow key={inv._id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-blue-600">{inv.invoiceNumber}</TableCell>
                        <TableCell className="capitalize">{inv.customer?.name || "-"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            inv.invoiceType?.toLowerCase() === "sales" ? "bg-blue-100 text-blue-700" : 
                            inv.invoiceType?.toLowerCase() === "job-card" ? "bg-purple-100 text-purple-700" :
                            "bg-indigo-100 text-indigo-700"
                          }`}>
                            {inv.invoiceType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              displayStatus === "completed"
                                ? "bg-green-100 text-green-700"
                                : displayStatus === "overdue"
                                ? "bg-red-100 text-red-700"
                                : displayStatus === "canceled"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </TableCell>

                        <TableCell className="font-semibold">₹{grandTotal.toLocaleString('en-IN')}</TableCell>
                        
                        <TableCell className={Number(inv.balanceDue) > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                          ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN')}
                        </TableCell>

                        <TableCell className="text-slate-600">
                          {inv.invoiceDate || inv.createdAt
                            ? new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN')
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* QUICK STATS SIDEBAR */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <div className="text-xs text-slate-500 mb-2">Invoice Success Rate</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {statsLoading ? "..." : `${successRate}%`}
                </span>
                <span className="text-xs text-slate-500 mb-1">
                  ({completedInvoices} of {totalInvoicesCount})
                </span>
              </div>
            </div>

            <div className="border-b pb-4">
              <div className="text-xs text-slate-500 mb-2">Average Invoice Value</div>
              <div className="text-3xl font-bold text-slate-800">
                {statsLoading ? "..." : `₹${avgInvoiceValue.toLocaleString('en-IN')}`}
              </div>
            </div>

            <div className="border-b pb-4">
              <div className="text-xs text-slate-500 mb-2">Collection Rate</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {statsLoading ? "..." : `${collectionRate}%`}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Items with Low Stock</div>
              <div className="text-3xl font-bold text-red-600">
                {itemsLoading ? "..." : `${lowStock.length} / ${totalItems}`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LOW STOCK & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>

          <CardContent>
            {itemsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading items...</div>
            ) : lowStock.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-5xl mb-3">✓</p>
                <p className="text-slate-600 font-medium">All items are well stocked</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Part No</TableHead>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Sale Price</TableHead>
                      <TableHead className="font-semibold">Value</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {lowStock.slice(0, 5).map((item) => (
                      <TableRow key={item._id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs text-slate-600">{item.partNo}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-red-600 font-bold text-lg">
                          {item.stock}
                        </TableCell>
                        <TableCell>₹{Number(item.salePrice || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{((Number(item.stock) || 0) * (Number(item.salePrice) || 0)).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoicesLoading ? (
                <div className="text-center py-8 text-slate-500">Loading activity...</div>
              ) : recentInvoices.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No recent activity
                </div>
              ) : (
                recentInvoices.slice(0, 6).map((inv) => {
                  const isOverdue = inv.invoiceStatus !== "canceled" && 
                                   inv.invoiceStatus !== "completed" && 
                                   Number(inv.balanceDue || 0) > 0;
                  const displayStatus = isOverdue ? "overdue" : inv.invoiceStatus;
                  const grandTotal = Number(inv.totals?.grandTotal) || Number(inv.grandTotal) || 0;

                  return (
                    <div key={inv._id} className="flex items-start gap-3 border-b pb-3 last:border-0 hover:bg-slate-50 p-2 rounded transition-colors">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        displayStatus === "completed" ? "bg-green-500" :
                        displayStatus === "overdue" ? "bg-red-500" : 
                        displayStatus === "canceled" ? "bg-gray-500" :
                        "bg-yellow-500"
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm text-blue-600">{inv.invoiceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            inv.invoiceType?.toLowerCase() === "sales" ? "bg-blue-100 text-blue-700" : 
                            inv.invoiceType?.toLowerCase() === "job-card" ? "bg-purple-100 text-purple-700" :
                            "bg-indigo-100 text-indigo-700"
                          }`}>
                            {inv.invoiceType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            displayStatus === "completed" ? "bg-green-100 text-green-700" :
                            displayStatus === "overdue" ? "bg-red-100 text-red-700" :
                            displayStatus === "canceled" ? "bg-gray-100 text-gray-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 font-medium capitalize">
                          {inv.customer?.name || "Unknown Customer"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          ₹{grandTotal.toLocaleString('en-IN')} • {
                            inv.invoiceDate || inv.createdAt
                              ? new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN')
                              : "-"
                          }
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;