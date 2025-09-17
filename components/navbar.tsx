"use client";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  MoreHorizontal,
  ListTodo,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

interface Props {
  boardTitle?: string;
  onEditBoard?: () => void;
  onFilterClick?: () => void;
  filterCount?: number;
}

export default function Navbar({
  boardTitle,
  onEditBoard,
  onFilterClick,
  filterCount = 0,
}: Props) {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  // Shared brand/logo
  const Brand = (
    <Link href="/" className="flex items-center space-x-2 group">
      <ListTodo className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 transition-colors" />
      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
        Taskero
      </span>
    </Link>
  );

  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {Brand}
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              title="Toggle theme"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="flex items-center gap-2 p-2 rounded-full shadow bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
    );
  }

  if (isBoardPage) {
    return (
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>

              <span className="hidden sm:block h-5 w-px bg-gray-300 dark:bg-gray-600" />

              <div className="flex items-center min-w-0 space-x-2">
                <ListTodo className="text-blue-600 dark:text-blue-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {boardTitle}
                </span>
                {onEditBoard && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEditBoard}
                    aria-label="Edit board"
                  >
                    <MoreHorizontal />
                  </Button>
                )}
              </div>
            </div>

            {/* Right side */}
            {onFilterClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFilterClick}
                className={`${
                  filterCount > 0
                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                    : ""
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
                {filterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                  >
                    {filterCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Default (landing)
  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {Brand}

        {/* Desktop */}
        <div className="hidden sm:flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress}
              </span>
              <Link href="/dashboard">
                <Button size="sm">
                  Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t bg-white dark:bg-gray-900 px-4 py-3 space-y-2">
          {isSignedIn ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress}
              </p>
              <Link href="/dashboard">
                <Button size="sm" className="w-full">
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton>
                <Button variant="ghost" size="sm" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="w-full">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      )}
    </header>
  );
}
