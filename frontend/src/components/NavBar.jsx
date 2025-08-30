import { useState, useRef, useEffect } from "react";
import logo from "../assets/Pastra.svg"; // Adjust the path as necessary
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";

const ProfileSection = ({ user, logout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log(user)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsDropdownOpen(false); // Close dropdown

    // Handle different actions
    switch (action) {
      case "product":
        // Navigate to product page or handle action
        navigate("/SellerPage");
        break;
      case "logout":
        // Handle logout
        logout();
        break;
      default:
        break;
    }
  };

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="btn-anim flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-100 border border-yellow-400 shadow-sm hover:bg-yellow-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
        >
          <div>
            <span className="font-bold text-yellow-700">
              {user.colonyName || "Unnamed Colony"}
            </span>
          </div>
          {/* Optional dropdown arrow */}
          <svg
            className={`w-4 h-4 text-yellow-700 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="overflow-hidden absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="py-2">
              <button
                onClick={() => handleMenuItemClick("product")}
                className="btn-anim w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors duration-150 font-medium"
              >
                Go to Product Page
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => handleMenuItemClick("logout")}
                className="btn-anim w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("/authenticate")}
      className="px-5 btn-anim py-1 rounded-full h-10 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold transition-colors duration-200 whitespace-nowrap"
    >
      Sell Now
    </button>
  );
};

const NavBar = ({ user }) => {
  const navigate = useNavigate();
  const path = location.pathname;
  const { logout } = useUserStore();

  return (
    <div className="bg-yellow-300 z-40 shadow-lg w-full">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-2">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img
            src={logo}
            alt="PastraBeez Logo"
            className="h-11 w-15 object-contain"
          />
        </div>

        {/* Logo Text - Centered */}
        <h2 className="flex-1 bee-logo-desktop lg:inline hidden text-center">PastraBeez</h2>

        {/* Profile/Sell Button */}
        <ProfileSection user={user} logout={logout} />
      </div>

      {/* Navigation Links */}
      <div className="bg-white flex items-center justify-center gap-8 lg:gap-32 w-full px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100">
        <button
          className={
            path === "/"
              ? "text-yellow-700 font-semibold cursor-pointer border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-yellow-700 font-medium transition-colors duration-200 cursor-pointer"
          }
          onClick={() => navigate("/")}
        >
          Home
        </button>
        <button
          className={
            path === "/catalog"
              ? "text-yellow-700 font-semibold cursor-pointer border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-yellow-700 font-medium transition-colors duration-200 cursor-pointer"
          }
          onClick={() => navigate("/catalog")}
        >
          Hive
        </button>
        <button
          className={
            path === "/about-us"
              ? "text-yellow-700 font-semibold cursor-pointer border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-yellow-700 font-medium transition-colors duration-200 cursor-pointer"
          }
          onClick={() => navigate("/about-us")}
        >
          About Us
        </button>
      </div>
    </div>
  );
};

export default NavBar;
