import { useState, useRef, useEffect } from "react";
import logo from "../assets/Pastra.svg"; // Adjust the path as necessary
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import Notice from "./Notice";
import { useLocation } from "react-router-dom";
import Honeycell from "../assets/honey-cell.svg?react";

const ProfileSection = ({ user }) => {
  const { logout } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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
          className={`group btn-anim focus:scale-120 flex items-center gap-2 justify-center w-fit h-fit relative transition-all duration-300
            
            ${isDropdownOpen ? "rotate-360" : ""}
            `}
            >
          {/* rounded-full bg-yellow-100 border border-yellow-400  focus:ring-yellow-500 focus:ring-opacity-50  */}
            {user?.colonyName && (
              <Honeycell className="drop-shadow-sm group-hover:text-yellow-200 text-amber-100 h-10 w-10" />
            )}
            <span className="absolute font-bold text-yellow-700">
              {user.colonyName?.charAt(0).toUpperCase() || "0"}
            </span>
          {/* Optional dropdown arrow */}
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
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const {
    isVerifying,
    setVerificationProgress,
    sendVerifyEmail,
    cancelPolling,
    // debugVerification,
  } = useUserStore();
  // test
  useEffect(() => {
    if (isVerifying) {
      console.log("Sending verification email...");
      sendVerifyEmail();
    }
  }, [isVerifying, sendVerifyEmail]);

  const cancelVerify = () => {
    setVerificationProgress(false);
    cancelPolling();
    console.log("Verification cancelled");
  };

  return (
    <>
      {!location.pathname.includes("verify") && (
        <div className="bg-yellow-300 relative z-40 shadow-lg w-full">
          {
            isVerifying && (
              <Notice
                message={
                  "Email verification required, sending verification email..."
                }
                accept={{ fn: sendVerifyEmail, msg: "Resend" }}
                decline={{ fn: cancelVerify, msg: "Cancel" }}
              />
            ) //Setup a timer
          }

          {/* <button onClick={() => setVerificationProgress(!isVerifying)}>
            {isVerifying ? "\tisVerifying" : "not verifying"}
          </button> */}

          {/* <button
            className="bg-red-500 text-white p-2 m-2 rounded"
            onClick={() => debugVerification(user.email)}
          >
            Danger!!!
          </button> */}

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
            <h2 className="flex-1 select-none bee-logo-desktop lg:inline hidden text-center">
              PastraBeez
            </h2>

            {/* Profile/Sell Button */}
            <ProfileSection user={user} />
          </div>

          {/* Navigation Links */}
          <div
            className="select-none bg-white flex items-center justify-center gap-8 lg:gap-32 w-fu
      ll px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100"
          >
            <button
              className={`
                ${path === "/"
                  ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
                  : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"}
              `}
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className={
                path === "/catalog"
                  ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
                  : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
              }
              onClick={() => navigate("/catalog")}
            >
              Hive
            </button>
            <button
              className={
                path === "/about-us"
                  ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
                  : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
              }
              onClick={() => navigate("/about-us")}
            >
              About Us
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
