// import React, { useMemo } from "react";
// import { useUser } from "@clerk/clerk-react";

// import {
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   FileText,
//   Package,
//   AlertTriangle,
//   ShoppingCart,
// } from "lucide-react";

// import { useInvoices } from "@/features/invoice/useInvoice";
// import { usePurchaseList } from "@/features/purchase/usePurchase";

// const Home = () => {
//   const { user } = useUser();
//   console.log("User Info:", user);

//   // ===== Fetch ALL invoices =====
//   const { data: invoiceData, isLoading: invoiceLoading } = useInvoices({
//     page: 1,
//     limit: 1000,
//     type: "all",
//     status: "all",
//     search: "",
//     customerName: "",
//   });

//   const invoices = invoiceData?.data || [];

//   // ===== Fetch ALL purchases =====
//   const { data: purchaseData, isLoading: purchaseLoading } = usePurchaseList({
//     page: 1,
//     limit: 1000,
//   });

//   const purchases = purchaseData?.purchases || [];

//   // Flatten purchase items
//   const purchaseItems = purchases.flatMap((p) => p.items || []);

//   const stats = useMemo(() => {
//     const inv = invoices || [];
//     const pur = purchases || [];
//     const items = purchaseItems || [];

//     // --- ADD STOCK MERGING ---
//     const stockMap = {};

//     items.forEach((item) => {
//       const key = item.itemNumber;
//       if (!stockMap[key]) {
//         stockMap[key] = {
//           itemNumber: item.itemNumber,
//           quantity: 0,
//         };
//       }
//       stockMap[key].quantity += Number(item.quantity || 0);
//     });

//     const mergedStock = Object.values(stockMap);

//     // After merging, now check low stock (qty < 2)
//     const lowStockItems = mergedStock.filter((it) => it.quantity < 2);

//     // TOTAL REVENUE
//     const totalRevenue = inv.reduce(
//       (sum, inv) => sum + (inv?.totals?.grandTotal || 0),
//       0
//     );

//     // PENDING INVOICES
//     const pendingInvoices = inv.filter((i) => (i.balanceDue || 0) > 0);

//     // Recent 4 invoices sorted by date
//     const recentInvoices = [...inv]
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 4);

//     return {
//       totalInvoices: inv.length,
//       totalRevenue,
//       revenueGrowth: totalRevenue > 5000 ? 10.6 : 0,
//       invoiceGrowth: inv.length > 10 ? 12.4 : 0,
//       lowStockItems,
//       totalProducts: mergedStock.length,
//       pendingInvoices: pendingInvoices.length,
//       recentInvoices,
//       recentOrders: pur.length,
//     };
//   }, [invoices, purchases, purchaseItems]);

//   // ===== Stat Card UI Component =====
//   const StatCard = ({ title, value, growth, icon: Icon, color }) => (
//     <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
//       <div className="flex items-center justify-between mb-4">
//         <div className={`p-3 rounded-lg ${color}`}>
//           <Icon className="w-6 h-6 text-white" />
//         </div>

//         {growth !== undefined && (
//           <div
//             className={`flex items-center text-sm ${
//               growth >= 0 ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {growth >= 0 ? (
//               <TrendingUp className="w-4 h-4 mr-1" />
//             ) : (
//               <TrendingDown className="w-4 h-4 mr-1" />
//             )}
//             {Math.abs(growth)}%
//           </div>
//         )}
//       </div>

//       <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
//       <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
//     </div>
//   );

//   if (invoiceLoading || purchaseLoading)
//     return (
//       <div className="flex items-center justify-center h-72 text-xl text-gray-500 font-semibold">
//         Loading Dashboard...
//       </div>
//     );

//   return (
//     <div className="p-8">
//       {/* HEADER */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Welcome {user?.fullName}! 
          
//         </h1>
//         <p className="text-gray-600 mt-2">
//           Here's what's happening with your business today.
//         </p>
//       </div>

//       {/* ===== TOP CARDS ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Total Revenue"
//           value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
//           growth={stats.revenueGrowth}
//           icon={DollarSign}
//           color="bg-blue-500"
//         />

//         <StatCard
//           title="Total Invoices"
//           value={stats.totalInvoices}
//           growth={stats.invoiceGrowth}
//           icon={FileText}
//           color="bg-green-500"
//         />

//         <StatCard
//           title="Total Products"
//           value={stats.totalProducts}
//           icon={Package}
//           color="bg-purple-500"
//         />

//         <StatCard
//           title="Low Stock Alert"
//           value={stats.lowStockItems.length}
//           icon={AlertTriangle}
//           color="bg-red-500"
//         />
//       </div>

//       {/* ===== RECENT + LOW STOCK ===== */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Recent Invoices */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">
//             Recent Invoices
//           </h2>

//           <div className="space-y-4">
//             {stats.recentInvoices.map((inv) => (
//               <div
//                 key={inv._id}
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//               >
//                 <div>
//                   <p className="font-semibold text-gray-800">
//                     {inv.invoiceNumber}
//                   </p>
//                   <p className="text-sm text-gray-600">{inv.customer?.name}</p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(inv.createdAt).toLocaleDateString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="text-right">
//                   <p className="font-bold text-gray-800">
//                     ₹{inv.totals?.grandTotal?.toLocaleString("en-IN")}
//                   </p>

//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       inv.balanceDue > 0
//                         ? "bg-yellow-100 text-yellow-700"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {inv.balanceDue > 0 ? "Pending" : "Paid"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Low Stock Items */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-800">Low Stock Items</h2>
//             <AlertTriangle className="w-5 h-5 text-red-500" />
//           </div>

//           <div className="space-y-4">
//             {stats.lowStockItems.map((item, index) => (
//               <div
//                 key={index}
//                 className="p-4 bg-red-50 border border-red-200 rounded-lg"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <p className="font-semibold text-gray-800">
//                     {item.itemNumber}
//                   </p>

//                   <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
//                     Low Stock
//                   </span>
//                 </div>

//                 <p className="text-sm text-gray-600">
//                   Qty:{" "}
//                   <span className="font-bold text-red-600">
//                     {item.quantity}
//                   </span>
//                 </p>
//               </div>
//             ))}

//             {stats.lowStockItems.length === 0 && (
//               <p className="text-gray-600 text-sm">All items in good stock.</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== FOOTER CARDS ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
//           <ShoppingCart className="w-8 h-8 mb-3 opacity-80" />
//           <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
//           <p className="text-3xl font-bold">{stats.recentOrders}</p>
//         </div>

//         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
//           <FileText className="w-8 h-8 mb-3 opacity-80" />
//           <h3 className="text-lg font-semibold mb-2">Pending Invoices</h3>
//           <p className="text-3xl font-bold">{stats.pendingInvoices}</p>
//         </div>

//         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
//           <DollarSign className="w-8 h-8 mb-3 opacity-80" />
//           <h3 className="text-lg font-semibold mb-2">Revenue</h3>
//           <p className="text-3xl font-bold">
//             ₹{stats.totalRevenue.toLocaleString("en-IN")}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React from 'react'

const Home = () => {
  return (
    <div>
      Home
    </div>
  )
}

export default Home
