"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">EduVault</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <span className="text-sm text-muted max-sm:hidden">
                      {user.name} ({user.role})
                    </span>
                    <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                    <button 
                      onClick={logout}
                      className="text-sm font-medium text-red-600 dark:text-red-400 px-4 py-2 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
