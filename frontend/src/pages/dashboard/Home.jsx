import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, DollarSign, Package, AlertTriangle, 
  FileText, CheckCircle, Clock, ShoppingCart 
} from "lucide-react";
import { useInvoices } from "@/features/invoice/useInvoice";
import { useStockSummary, useItems } from "@/features/items/useItems";

// Table Components
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
    className="h-12 px-4 text-left align-middle font-medium text-slate-500"
    {...props}
  >
    {children}
  </th>
);

const TableRow = ({ children, ...props }) => (
  <tr className="border-b transition-colors hover:bg-slate-50/50" {...props}>
    {children}
  </tr>
);

const TableCell = ({ children, ...props }) => (
  <td className="p-4 align-middle" {...props}>
    {children}
  </td>
);

const Home = () => {
  // 🔹 STOCK SUMMARY
  const { data: stockSummary, isLoading: stockLoading } = useStockSummary();

  // 🔹 FETCH ALL INVOICES FOR ACCURATE STATS
  const { data: allInvoicesData, isLoading: statsLoading } = useInvoices({
    page: 1,
    limit: 1000, 
    type: "all",
    status: "all",
    search: "",
    customerName: "",
  });

  // 🔹 RECENT INVOICES FOR DISPLAY
  const { data: recentInvoicesData, isLoading: invoicesLoading } = useInvoices({
    page: 1,
    limit: 10,
    type: "all",
    status: "all",
    search: "",
    customerName: "",
  });

  // 🔹 ALL ITEMS
  const { data: itemsData, isLoading: itemsLoading } = useItems({
    page: 1,
    limit: 100,
    q: "",
  });

  // ---- SAFE VALUES WITH NULL CHECKS ----
  const allInvoices = allInvoicesData?.data ?? [];
  const totalInvoicesCount = allInvoicesData?.meta?.totalDocs ?? 0;
  const recentInvoices = recentInvoicesData?.data ?? [];

  const completedInvoices = allInvoices.filter(
    (i) => i.invoiceStatus === "completed"
  ).length;

  const pendingInvoices = allInvoices.filter(
    (i) => i.invoiceStatus === "pending"
  ).length;

  const lowStock = itemsData?.data?.filter((item) => Number(item.stock) <= 3) ?? [];
  const stockValue = Number(stockSummary?.stockValue || 0);

  // Revenue calculations
  const totalRevenue = allInvoices
    .filter((i) => i.invoiceStatus === "completed")
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

  const totalPending = allInvoices
    .filter((i) => i.invoiceStatus === "pending" && Number(i.balanceDue || 0) > 0)
    .reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  // Invoice type counts
  const salesInvoices = allInvoices.filter(
    (i) => i.invoiceType?.toLowerCase() === "sales"
  ).length;
  
  const jobCardInvoices = allInvoices.filter(
    (i) => i.invoiceType?.toLowerCase() === "job-card"
  ).length;

  const advanceInvoices = allInvoices.filter(
    (i) => i.invoiceType?.toLowerCase() === "advance"
  ).length;

  const totalItems = itemsData?.meta?.totalDocs ?? 0;

  const avgInvoiceValue = totalInvoicesCount > 0 
    ? Math.round(allInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0) / totalInvoicesCount)
    : 0;

  const collectionRate = (totalRevenue + totalPending) > 0
    ? Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)
    : 0;

  const successRate = totalInvoicesCount > 0 
    ? Math.round((completedInvoices / totalInvoicesCount) * 100) 
    : 0;

  // Chart Data
  const invoiceTypeData = [
    { name: 'Sales', value: salesInvoices, color: '#3b82f6' },
    { name: 'Job Card', value: jobCardInvoices, color: '#a855f7' },
    { name: 'Advance', value: advanceInvoices, color: '#10b981' },
  ].filter(d => d.value > 0);

  const invoiceStatusData = [
    { name: 'Completed', value: completedInvoices, color: '#22c55e' },
    { name: 'Pending', value: pendingInvoices, color: '#eab308' },
  ].filter(d => d.value > 0);

  const revenueData = [
    { name: 'Revenue', amount: totalRevenue, fill: '#22c55e' },
    { name: 'Pending', amount: totalPending, fill: '#f59e0b' },
  ];

  const stockStatusData = [
    { name: 'Low Stock', value: lowStock.length, color: '#ef4444' },
    { name: 'Normal Stock', value: totalItems - lowStock.length, color: '#22c55e' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="space-y-6 p-4 sm:p-6">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 mt-2">
            Track invoices, payments and stock — all in one place.
          </p>
        </div>

        {/* PRIMARY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                <DollarSign className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {statsLoading ? "..." : `₹${(totalRevenue / 100000).toFixed(1)}L`}
              </div>
              <p className="text-xs opacity-80">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Pending Amount</CardTitle>
                <Clock className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {statsLoading ? "..." : `₹${(totalPending / 100000).toFixed(1)}L`}
              </div>
              <p className="text-xs opacity-80">₹{totalPending.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Stock Value</CardTitle>
                <Package className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {stockLoading ? "..." : `₹${(stockValue / 100000).toFixed(1)}L`}
              </div>
              <p className="text-xs opacity-80">{totalItems} items</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Low Stock Alert</CardTitle>
                <AlertTriangle className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {itemsLoading ? "..." : lowStock.length}
              </div>
              <p className="text-xs opacity-80">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* SECONDARY KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-slate-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {statsLoading ? "..." : totalInvoicesCount}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? "..." : salesInvoices}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">Job Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statsLoading ? "..." : jobCardInvoices}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">Advance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {statsLoading ? "..." : advanceInvoices}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? "..." : completedInvoices}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statsLoading ? "..." : pendingInvoices}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue vs Pending */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Invoice Types Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Invoice Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={invoiceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {invoiceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No invoice data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Status Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Invoice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={invoiceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {invoiceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No status data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Status */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No stock data available
                </div>
              )}
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
                      const totalAmount = Number(inv.totalAmount) || 0;

                      return (
                        <TableRow key={inv._id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-blue-600">{inv.invoiceNumber}</TableCell>
                          <TableCell className="capitalize">{inv.customer?.name || "-"}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              inv.invoiceType?.toLowerCase() === "sales" ? "bg-blue-100 text-blue-700" : 
                              inv.invoiceType?.toLowerCase() === "job-card" ? "bg-purple-100 text-purple-700" :
                              inv.invoiceType?.toLowerCase() === "advance" ? "bg-emerald-100 text-emerald-700" :
                              "bg-indigo-100 text-indigo-700"
                            }`}>
                              {inv.invoiceType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                inv.invoiceStatus === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {inv.invoiceStatus}
                            </span>
                          </TableCell>

                          <TableCell className="font-semibold">₹{totalAmount.toLocaleString('en-IN')}</TableCell>
                          
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
          <Card className="shadow-sm bg-gradient-to-br from-slate-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Success Rate
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    {statsLoading ? "..." : `${successRate}%`}
                  </span>
                  <span className="text-xs text-slate-500 mb-1">
                    ({completedInvoices}/{totalInvoicesCount})
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Avg Invoice Value
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {statsLoading ? "..." : `₹${avgInvoiceValue.toLocaleString('en-IN')}`}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Collection Rate
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {statsLoading ? "..." : `${collectionRate}%`}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Low Stock Items
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {itemsLoading ? "..." : `${lowStock.length}/${totalItems}`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LOW STOCK ALERTS */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>

          <CardContent>
            {itemsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading items...</div>
            ) : lowStock.length === 0 ? (
              <div className="text-center py-12 bg-green-50 rounded-lg">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium text-lg">All items are well stocked</p>
                <p className="text-slate-500 text-sm mt-1">No immediate action required</p>
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
                      <TableRow key={item._id} className="hover:bg-red-50">
                        <TableCell className="font-mono text-xs text-slate-600 bg-slate-50">{item.partNo}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold text-lg bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-4 h-4" />
                            {item.stock}
                          </span>
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
      </div>
    </div>
  );
};

export default Home;