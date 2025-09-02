"use client"

import { Trello } from "lucide-react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname() // call the hook

  const isDashboardPage = pathname === "/dashboard"
  const isBoardPage = pathname.startsWith("/board/")

  // Hide navbar on dashboard
if (isDashboardPage) {
  return (
    <nav className="relative w-full bg-gray-900/90 backdrop-blur-md p-4 flex items-center justify-between shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <Trello className="text-white w-8 h-8 hover:text-blue-400 transition-colors duration-300" />
        <span className="text-white font-extrabold text-xl select-none tracking-wide">
          Taskero
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <UserButton />
      </div>
    </nav>);
  }

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-gray-900/90 backdrop-blur-md p-4 flex items-center justify-between shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <Trello className="text-white w-8 h-8 hover:text-blue-400 transition-colors duration-300" />
        <span className="text-white font-extrabold text-xl select-none tracking-wide">
          Taskero
        </span>
      </div>

      {/* Auth / User Section */}
      <div className="flex items-center space-x-4">
        {isSignedIn ? (
          <div className="flex items-center space-x-3">

            {/* Go to Dashboard button */}
            <Link href="/dashboard">
              <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-md text-sm">
                Go to Dashboard
              </Button>
            </Link>

            {/* User profile button */}
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Sign In as ghost button */}
            <SignInButton>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-white hover:text-blue-400 transition-colors duration-300"
              >
                Sign In
              </Button>
            </SignInButton>

            {/* Sign Up as button */}
            <SignUpButton>
              <Button className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-500 transition-all duration-300 shadow-md">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </nav>
  )
}
