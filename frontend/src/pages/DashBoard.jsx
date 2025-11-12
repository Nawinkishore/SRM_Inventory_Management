import React, { useState } from 'react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/home/Navbar';
import Sidebar from '@/components/home/Sidebar';

const DashBoard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mutate: logout } = useLogout();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
       
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashBoard;