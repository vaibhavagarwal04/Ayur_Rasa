"use client";

import Link from "next/link";
import { FaLeaf, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1A3129] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-3">
            Ayurvedic Wellness
          </h2>
          <p className="text-sm">
            Personalized diet plans and lifestyle tips based on ancient
            Ayurvedic principles to balance your doshas and improve overall
            wellbeing.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-3">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#home" className="hover:text-green-600 transition">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#features"
                className="hover:text-green-600 transition"
              >
                Features
              </Link>
            </li>
            <li>
              <Link href="/#dosha" className="hover:text-green-600 transition">
                Dosha
              </Link>
            </li>
            <li>
              <Link
                href="/#how-it-works"
                className="hover:text-green-600 transition"
              >
                How it Works
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-3">Contact</h2>
          <p className="text-sm">📧 vaibhav.2327cs1044@kiet.edu</p>
          <p className="text-sm">📍 Ghaziabad, India</p>
          <div className="flex space-x-4 mt-3">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition text-lg"
            >
              <FaLeaf />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition text-lg"
            >
              <FaFacebook />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition text-lg"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#1A3129] text-center py-3 text-sm">
        © {new Date().getFullYear()} Ayurvedic Wellness. All rights reserved.
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center px-4 py-2 text-sm">
          <Link
            href="/#home"
            className="text-gray-700 hover:text-green-600 transition"
          >
            Home
          </Link>
          <Link
            href="/#features"
            className="text-gray-700 hover:text-green-600 transition"
          >
            Features
          </Link>
          <Link
            href="/#dosha"
            className="text-gray-700 hover:text-green-600 transition"
          >
            Dosha
          </Link>
          <Link
            href="/#how-it-works"
            className="text-gray-700 hover:text-green-600 transition"
          >
            Works
          </Link>
        </div>
      </div>
    </footer>
  );
}
