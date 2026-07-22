"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";

export default function NavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white ">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between ">
        {/* LEFT - Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <img
              src="/newsbit_logo/logo_without_bg.png"
              alt="Newsbit Logo"
              className="h-7 w-7"
            />
            <div className="flex flex-col">
              <span className="text-[17px] font-medium text-gray-900">
                Newsbit
              </span>
              <span className="text-[12px] text-gray-600">AI-Powered News</span>
            </div>
          </div>
        </Link>

        {/* CENTER - Navigation Links */}
        <div className="flex items-center gap-8">
          <a
            href="#todays-brief"
            onClick={(e) => handleScrollToSection(e, "todays-brief")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Today's Brief
          </a>
          <a
            href="#explore"
            onClick={(e) => handleScrollToSection(e, "explore")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Explore
          </a>
        </div>

        {/* RIGHT - Account Actions */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                    <Link
                      href="/chats"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Chats
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Saved Articles
                    </Link>
                    <Link
                      href="/history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      History
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
