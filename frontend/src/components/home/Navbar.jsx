import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white border-b fixed w-full z-30 top-0">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>

          <Button
            variant="destructive"
            onClick={() => signOut({ redirectUrl: "/login" })}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
