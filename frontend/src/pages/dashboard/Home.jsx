import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown, DollarSign, FileText, Package, AlertTriangle, ShoppingCart, Users } from "lucide-react";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalRevenue: 12845.50,
    revenueGrowth: 12.5,
    totalInvoices: 47,
    invoiceGrowth: 8.3,
    lowStock: 8,
    totalProducts: 156,
    recentOrders: 23
  });

  const recentInvoices = [
    { id: "INV011", customer: "Vignesh P", amount: 401.20, status: "paid", date: "15 Apr 2025" },
    { id: "INV010", customer: "Harish Narayan", amount: 413.00, status: "paid", date: "10 Apr 2025" },
    { id: "INV009", customer: "Sathish K", amount: 377.60, status: "paid", date: "01 Apr 2025" }
  ];

  const lowStockItems = [
    { name: "Product A", stock: 5, minStock: 20, category: "Electronics" },
    { name: "Product B", stock: 3, minStock: 15, category: "Accessories" },
    { name: "Product C", stock: 8, minStock: 25, category: "Hardware" }
  ];

  const StatCard = ({ title, value, growth, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          growth={stats.invoiceGrowth}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Invoices</h2>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{invoice.id}</p>
                  <p className="text-sm text-gray-600">{invoice.customer}</p>
                  <p className="text-xs text-gray-500">{invoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{invoice.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Low Stock Items</h2>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Low Stock</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current: <span className="font-bold text-red-600">{item.stock}</span></span>
                  <span className="text-gray-600">Min: {item.minStock}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all" 
                    style={{ width: `${(item.stock / item.minStock) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <ShoppingCart className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
          <p className="text-3xl font-bold">{stats.recentOrders}</p>
          <p className="text-sm opacity-80 mt-2">In the last 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <FileText className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Total Invoices</h3>
          <p className="text-3xl font-bold">{stats.totalInvoices}</p>
          <p className="text-sm opacity-80 mt-2">Generated this month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <Package className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Stock Value</h3>
          <p className="text-3xl font-bold">₹45,320</p>
          <p className="text-sm opacity-80 mt-2">Total inventory value</p>
        </div>
      </div>
    </div>
  );
};

export default Home;