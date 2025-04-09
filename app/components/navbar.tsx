/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">🤖 AI Agent</span>
        </Link>

        <div className="flex items-center space-x-6">
          {mounted && (
            <>
              <Link
                href="/"
                className={`text-sm ${
                  pathname === "/"
                    ? "font-semibold text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-sm ${
                      pathname === "/dashboard"
                        ? "font-semibold text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Sign Out
                  </button>

                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`text-sm ${
                      pathname === "/auth/login"
                        ? "font-semibold text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
