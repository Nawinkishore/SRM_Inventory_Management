import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';

export default function Navbar({ isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="bg-white border-b fixed w-full z-30 top-0">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* optional search / actions can go here */}

            {/* Profile avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="true"
              >
                <img
                  src={(profile && profile.profileImage) || 'https://github.com/shadcn.png'}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover border"
                />
              
              </button>

              {/* Dropdown panel */}
              {open && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={(profile && profile.profileImage) || 'https://github.com/shadcn.png'}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Link to="/dashboard/profile" onClick={() => setOpen(false)} className="w-full">
                        <Button className="w-full justify-start" variant="ghost">
                          <User className="mr-2" size={16} />
                          View Profile
                        </Button>
                      </Link>

                      <button
                        onClick={() => {
                          setOpen(false);
                          handleLogout && handleLogout();
                        }}
                        className="w-full inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">Signed in as <span className="font-medium text-gray-700">{user?.email}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}



 {/* <DropdownMenu>
            
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
          </DropdownMenu> */}