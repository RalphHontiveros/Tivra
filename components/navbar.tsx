"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="font-bold text-xl">Taskero</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="hover:bg-blue-700 px-3 py-2 rounded">
              Home
            </Link>
            <Link href="/boards" className="hover:bg-blue-700 px-3 py-2 rounded">
              Boards
            </Link>
            <Link href="/about" className="hover:bg-blue-700 px-3 py-2 rounded">
              About
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-blue-600">
          <Link href="/" className="block px-3 py-2 rounded hover:bg-blue-700">
            Home
          </Link>
          <Link href="/boards" className="block px-3 py-2 rounded hover:bg-blue-700">
            Boards
          </Link>
          <Link href="/about" className="block px-3 py-2 rounded hover:bg-blue-700">
            About
          </Link>
        </div>
      )}
    </nav>
  );
}
