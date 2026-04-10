"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CgProfile } from "react-icons/cg";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname() || "/";

  const getBasePath = (href: string) => href.split("#")[0] || "/";

  const navLinkClass = (href: string) => {
    const basePath = getBasePath(href);
    return `transition ${pathname === basePath ? "text-green-600 font-semibold" : "text-gray-700 hover:text-green-600"}`;
  };

  // Check localStorage for login status on component mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData) as User);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check on mount
    checkLoginStatus();

    // Listen for storage changes (when login happens from another tab/page)
    window.addEventListener("storage", checkLoginStatus);

    // Custom event listener for same-page login
    window.addEventListener("loginStateChange", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginStateChange", checkLoginStatus);
    };
  }, []);

  const loginButtonClasses =
    "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition";
  const signupButtonClasses =
    "ml-3 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition bg-white";
  const profileButtonClasses =
    "group flex items-center gap-3 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-gray-800 transition hover:border-green-200 hover:bg-green-100";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);

    // Dispatch custom event to update other components if needed
    window.dispatchEvent(new Event("loginStateChange"));

    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-sm z-40">
      <div className="flex items-center justify-between py-4 px-6 md:px-16">
        <Logo />

        {/* Desktop Navigation links */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link href="/#home" className={navLinkClass("/#home")}>Home</Link>
          </li>
          <li>
            <Link href="/#features" className={navLinkClass("/#features")}>Features</Link>
          </li>
          <li>
            <Link href="/#dosha" className={navLinkClass("/#dosha")}>Dosha</Link>
          </li>
          <li>
            <Link
              href="/#how-it-works"
              className={navLinkClass("/#how-it-works")}
            >
              How it Works
            </Link>
          </li>
          {isLoggedIn && user?.role === "PATIENT" && (
            <>
              <li>
                <Link href="/assessment" className={navLinkClass("/assessment")}>
                  Dosha Assessment
                </Link>
              </li>
              <li>
                <Link href="/diet-plan" className={navLinkClass("/diet-plan")}>
                  Weekly Diet Plan
                </Link>
              </li>
            </>
          )}
          {isLoggedIn && user?.role === "DOCTOR" && (
            <li>
              <Link href="/Dashboard" className={navLinkClass("/Dashboard")}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Desktop Auth Buttons / Profile Icon */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn && user ? (
            <>
              <Link
                href="/profile"
                className={profileButtonClasses}
                aria-label="View profile"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-sm transition group-hover:bg-green-700">
                  <CgProfile size={22} />
                </span>
                <span className="max-w-32 truncate text-sm font-semibold text-gray-800">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={loginButtonClasses}>
                Login
              </Link>
              <Link href="/login" className={signupButtonClasses}>
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 p-2 rounded"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 relative z-50 shadow-lg">
          <ul className="py-4 px-6 space-y-4">
            <li>
              <Link
                href="/#home"
                className={navLinkClass("/#home")}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#features"
                className={navLinkClass("/#features")}
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/#dosha"
                className={navLinkClass("/#dosha")}
                onClick={() => setIsMenuOpen(false)}
              >
                Dosha
              </Link>
            </li>
            <li>
              <Link
                href="/#how-it-works"
                className={navLinkClass("/#how-it-works")}
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
            </li>
            {isLoggedIn && user?.role === "PATIENT" && (
              <>
                <li>
                  <Link
                    href="/assessment"
                    className={navLinkClass("/assessment")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dosha Assessment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/diet-plan"
                    className={navLinkClass("/diet-plan")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Weekly Diet Plan
                  </Link>
                </li>
              </>
            )}
            {isLoggedIn && user?.role === "DOCTOR" && (
              <li>
                <Link
                  href="/Dashboard"
                  className={navLinkClass("/Dashboard")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Auth Buttons / Profile Icon */}
          <div className="px-6 pb-4 space-y-3">
            {isLoggedIn && user ? (
              <>
                <div className="text-gray-700 text-center text-sm mb-2">
                  Welcome, {user.name}!
                </div>
                <Link
                  href="/profile"
                  className="block rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-green-800 transition hover:bg-green-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex justify-center items-center space-x-2">
                    <CgProfile size={24} className="text-green-700" />
                    <span>View Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="block text-center border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition bg-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
