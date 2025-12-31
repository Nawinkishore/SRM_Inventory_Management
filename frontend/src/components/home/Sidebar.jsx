import React from "react";
import {
  Home,
  FileText,
  Container,
  ShoppingCart,
  EqualApproximately 
 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    {
      id: "invoice",
      label: "Invoice Generator",
      icon: FileText,
      path: "/dashboard/invoice",
    },
    {
      id: "invoiceList",
      label: "Invoice List",
      icon: Container,
      path: "/dashboard/invoices",
    },
    {
      id: "Add Stock",
      label: "Add Stock",
      icon: ShoppingCart,
      path: "/dashboard/stocks",
    },
    {
      id: "quotation",
      label: "Quotation",
      icon: EqualApproximately,
      path: "/dashboard/quotation",
    }
    // {id :'excel',label:'Import Excel', icon: Sheet, path:'/dashboard/excel' },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          <nav className="flex-1 px-3 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex hover:cursor-pointer items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
