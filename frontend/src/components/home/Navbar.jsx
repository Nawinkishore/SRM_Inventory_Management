import React from "react";
import { Menu, X } from "lucide-react";

import { UserButton } from "@clerk/clerk-react";
import TextType from "@/components/TextType";

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
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

            <div>
              <TextType
                text={[
                  "Welcome to SRM Inventory",
                  "Manage your stock with ease.",
                  "Generate invoices quickly.",
                  "Stay organized effortlessly.",
                  "Happy managing!",
                ]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
              />
            </div>
          </div>

          <UserButton />
        </div>
      </div>
    </nav>
  );
}
