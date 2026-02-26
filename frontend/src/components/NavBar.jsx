import { useState, useRef, useEffect, useCallback } from "react";
import logo from "../assets/Pastra.svg"; // Adjust the path as necessary
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import BeeOverlay from "./Notice";
import { useLocation } from "react-router-dom";
import Honeycell from "../assets/honey-cell.svg?react";
import toast from "react-hot-toast";

const CodeInput = () => {
  const isCodeSent = useUserStore((s) => s.isCodeSent);
  const digits=6;
  const [values, setValues] = useState(Array(digits).fill(" "));
  const inputsRef = useRef([]);
  const verification = useUserStore((s) => s.checkCode);
  const email = useUserStore((s) => s.tempEmail);
  const onComplete = useCallback(async (code) => {
    if (verification) await verification(code, email);
  }, [verification, email]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    const code = values.join("").trim();
    if (code.length === digits && !values.includes(" ")) {
      Promise.resolve().then(() => onComplete(code)).catch(() => {
        toast.success("Tip: select a digit to change and press a number instead of deleting it.");
      });
    }
  }, [values, onComplete]);

  // Only for desktop
  const handleKeyDown = (e, idx) => {
    if (e.key === "ArrowLeft") {
      inputsRef.current[Math.max(0, idx - 1)]?.focus();
    } else if (e.key === "ArrowRight") {
      inputsRef.current[Math.min(digits - 1, idx + 1)]?.focus();
    }
  };

  const handleChange = (e, idx) => {
    const value = e.target.value;
    const next = [...values];
    if (value.length > 1) {
      const chars = value
        .split("")
        .filter((c) => /[0-9]/.test(c))
        .slice(0, digits);
      chars.forEach((c, i) => {
        next[Math.min(digits - 1, i)] = c;
      });
      setValues(next);
      inputsRef.current[Math.min(digits -1, chars.length )]?.focus();
      return;
    } else {
      if (value === "") {
        next[idx] = " ";
        if (values[idx - 1]) {
          inputsRef.current[idx-1]?.focus();
        }
        setValues(next);
      } else if (/[0-9]/.test(value)) {
        if (next[idx]) {
          next[idx] = value;
          inputsRef.current[Math.min(digits - 1, idx + 1)]?.focus();
        } else if (idx < digits) {
          next[idx] = value;
          inputsRef.current[Math.min(digits - 1, idx+1)]?.focus();
        }
        setValues(next);
      }
    }
      
// else if (e.target.value === "ArrowLeft") {
//         console.log("Pressed left")
//         inputsRef.current[Math.max(0, idx - 1)]?.focus();
//       } else if (e.target.value === "ArrowRight") {
//         inputsRef.current[Math.min(digits - 1, idx + 1)]?.focus();

    
    // // Handle single digit input
    // if (/^[0-9]$/.test(value)) {
    //   const next = [...values];
    //   next[idx] = value;
    //   setValues(next);
    //   if (idx < digits - 1) {
    //     setTimeout(() => inputsRef.current[idx + 1]?.focus(), 10);
    //   }
    // }
  };

  const handleFocus = (idx) => {
    if (values[idx]) {
      setTimeout(() => {
        inputsRef.current[idx]?.select();
      }, 10);
    }
  };

  // Mobile only
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData("text")
      .trim();
    const chars = text
      .split("")
      .filter((c) => /[0-9]/.test(c))
      .slice(0, digits);
    const next = [...values];
    for (let i = 0; i < digits; i++) {
      if (chars[i]) {
        next[i] = chars[i];
      } else {
        next[i] = "";
      }
    }
    setValues(next);
    // Focus the next empty field or the last filled field
    const nextEmptyIndex = next.findIndex(val => val === "");
    const focusIndex = nextEmptyIndex === -1 ? digits - 1 : nextEmptyIndex;
    setTimeout(() => inputsRef.current[focusIndex]?.focus(), 10);
  };

  return (
    isCodeSent &&
    <div className="flex flex-col items-center gap-2">
      {email && (
        <p className="text-xs text-amber-700">
          A code was sent to <strong>{email}</strong>
        </p>
      )}
      <div 
        className="flex gap-2 my-2"
        onPaste={handlePaste}
      >
        {Array.from({ length: digits }).map((_, i) => (
          <input
            key={"code-input-" + i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={digits} // Allow more characters to catch paste
            className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-amber-50 border-2 border-amber-200 focus:border-amber-400 focus:outline-none shadow-sm"
            value={values[i]}
            onChange={(e) => handleChange(e, i)}
            onFocus={() => handleFocus(i)}
            onPaste={handlePaste}
            onKeyDown={(e) => {handleKeyDown(e, i)}}
            aria-label={`Code digit ${i + 1}`}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        ))}
      </div>
    </div>
  );
};

const Timer = () => {
  const coolDown = useUserStore((s) => s.coolDown);
  return (
    coolDown>0 ? <div>({coolDown})</div> : null
  );
}

const ProfileSection = ({ user }) => {
  const { logout, deleteAccount } = useUserStore();
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
      case "delete":
        // Handle account deletion
        deleteAccount();
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
          {user && (
            <Honeycell className="drop-shadow-sm group-hover:text-yellow-200 text-amber-100 h-10 w-10" />
          )}
          <span className="absolute font-bold text-yellow-700">
            {user.role === "seller"
              ? user.colonyName?.charAt(0).toUpperCase() || "0"
              : user.email?.charAt(0).toUpperCase() || "0"}
          </span>
          {/* Optional dropdown arrow */}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="overflow-hidden absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="py-2">
              {user.role === "seller" && (
                <>
                  <button
                    onClick={() => handleMenuItemClick("product")}
                    className="btn-anim w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors duration-150 font-medium"
                  >
                    Go to Product Page
                  </button>
                  <hr className="my-1 border-gray-200" />
                </>
              )}
              <button
                onClick={() => handleMenuItemClick("logout")}
                className="btn-anim w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium"
              >
                Log Out
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => handleMenuItemClick("delete")}
                className="btn-anim w-full text-left px-4 py-3 text-red-700 hover:bg-red-100 transition-colors duration-150 font-medium"
              >
                Delete Account
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
      Sign In
    </button>
  );
};

const NavBar = ({ user }) => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const isVerifying = useUserStore((s) => s.isVerifying);
  const setVerificationProgress = useUserStore(
    (s) => s.setVerificationProgress
  );
  const tempEmail = useUserStore((s) => s.tempEmail);
  const sendVerifyEmail = useUserStore((s) => s.sendVerifyEmail);
  const startCountDown = useUserStore((s) => s.startCountDown);
  const cancelVerification = useUserStore((s) => s.cancelVerification);
  const isLoading = useUserStore((s) => s.loading);
  // const debugVerification = useUserStore((s) => s.debugVerification);
  // test

  useEffect(() => {
    const send = async () => {
      if (isVerifying) {
        await sendVerifyEmail();
        startCountDown();
      }
    };
    send();
  }, [isVerifying, sendVerifyEmail, startCountDown]);

  const cancelVerify = () => {
    setVerificationProgress(false);
    cancelVerification(tempEmail);
  };

  return (
    <div className="bg-yellow-300 relative z-40 shadow-lg w-full">
      {
        isVerifying && (
          <BeeOverlay
            style={`${isLoading ? "pointer-events-none opacity-70" : ""}`}
            message={
              "Email verification required, sending verification email...Check your Inbox..."
            }
            accept={{
              fn: async() => {
                const status = await sendVerifyEmail();
                if ((status-200)<100) startCountDown();
              },
              msg: "Resend",

              time: <Timer/>
            }}
            addon = {<CodeInput/>}
            decline={{ fn: cancelVerify, msg: "Cancel" }}
            isCritical={true}
          />
        ) //Setup a timer
      }

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
            ${
              path === "/"
                ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
                : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
            }
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
  );
};

export default NavBar;
