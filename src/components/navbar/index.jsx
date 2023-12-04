import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { NAVIGATION } from "/src/lib/constants";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white-900 p-5 border-b-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
        {/* Logo on the left */}
        <div>
          <Link
            to="/"
            className="text-black Times text-lg lg:text-4xl font-extrabold tracking-tight"
          >
            Sold n´Bought
          </Link>
        </div>

        {/* Hamburger icon for small screens on the right */}
        <div className="lg:hidden ml-auto">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none text-transparent"
          >
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-black"></div>
              <div className="w-6 h-0.5 bg-black"></div>
              <div className="w-6 h-0.5 bg-black"></div>
            </div>
          </button>
        </div>

        {/* Navbar links for larger screens and centered for small screens */}
        <div
          className={`lg:flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 ${
            isOpen ? "flex flex-col items-center" : "hidden"
          } justify-center mt-4 lg:mt-0`}
        >
          {NAVIGATION.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-black Times hover:text-black-900 hover:border-b transition duration-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
