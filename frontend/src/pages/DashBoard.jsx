import React, { useState } from 'react';

import { Outlet } from 'react-router-dom';
import Navbar from '@/components/home/Navbar';
import Sidebar from '@/components/home/Sidebar';
const DashBoard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}

      />

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      
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