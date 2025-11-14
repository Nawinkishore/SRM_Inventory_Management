import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { User, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setActiveMenu, handleLogout }) => {
    const { user } = useSelector((state) => state.auth);
    const {profile1} = useSelector((state) => state.profile);
  return (
    <nav className="bg-white border-b fixed w-full z-30 top-0">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 ">
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
                  {profile1 && profile1.profileImage ? (
                    <AvatarImage src={profile1.profileImage} alt="User Avatar" />
                  ) : (
                    <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/dashboard/profile">
              <DropdownMenuItem onClick={() => setActiveMenu('profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem></Link>
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
  );
};

export default Navbar;