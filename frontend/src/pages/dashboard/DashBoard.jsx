import React, { useState } from 'react';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Home, User, LogOut, Menu, X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const DashBoard = () => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b fixed w-full z-30 top-0">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveMenu('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          <nav className="flex-1 px-3 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex hover:cursor-pointer items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center  hover:cursor-pointer px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
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

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {activeMenu === 'home' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">1,234</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Sessions</h3>
                  <p className="text-3xl font-bold text-green-600">456</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600">$12,345</p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
              <div className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">John Doe</h3>
                    <p className="text-gray-500">john.doe@example.com</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">John Doe</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">john.doe@example.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-gray-900">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashBoard;