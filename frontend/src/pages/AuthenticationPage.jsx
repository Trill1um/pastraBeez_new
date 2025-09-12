import React, { useState } from "react";
import { useUserStore } from "../stores/useUserStore.js";
import beeIcon from "../assets/logo.png"; // Assuming you have a bee icon asset

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    colonyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    messengerLink: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});

  const { signUp, login, loading } = useUserStore();

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      colonyName: "",
      email: "",
      password: "",
      confirmPassword: "",
      messengerLink: "",
      acceptTerms: false,
    });
    setErrors({});
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.colonyName) {
        newErrors.colonyName = "Colony name is required";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData.messengerLink) {
        newErrors.messengerLink = "Messenger link is required";
      } else if (
        !formData.messengerLink.includes("m.me/") &&
        !formData.messengerLink.includes("messenger.com/")
      ) {
        newErrors.messengerLink =
          "Please provide a valid Messenger link (e.g., m.me/username)";
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Please accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isLogin) {
      // Handle login
      login(formData.email, formData.password);
    } else {
      // Handle signup
      signUp(
        formData.colonyName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.messengerLink
      );
    }
  };

  const [isDataModalVisible, setIsDataModalVisible] = useState(false);

  // Example useEffect to close modal on Escape key

  return (
    <div className="min-h-screen w-full">
      {/* Bee-themed Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
        <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className={`${isDataModalVisible? "flex": "hidden"} fixed inset-0 bg-black/30 items-center justify-center z-50`}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          <button
            onClick={() => setIsDataModalVisible(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Data Use Notice
          </h3>
          <p className="text-gray-700 mb-3">This research tool collects:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>Email addresses for account creation</li>
            <li>Survey responses for research analysis</li>
            <li>Usage patterns to improve the tool</li>
          </ul>
          <p className="text-gray-700 text-sm">
            Your data will be kept confidential and used only for research
            purposes...
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 lg:py-16 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Form Container */}
          <div className="card rounded-[50px] p-8 lg:p-16 shadow-xl max-w-2xl w-full">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div
                className="bg-center bg-cover bg-no-repeat h-[80px] w-[100px] mx-auto mb-4"
                style={{ backgroundImage: `url('${beeIcon}')` }}
              />
              <h1 className="bee-title-h4-desktop mb-2">
                {isLogin ? "Welcome Back to the Hive! 🍯" : "Join the Hive! 🐝"}
              </h1>
              <p className="bee-body-text-desktop text-secondary">
                {isLogin
                  ? "Sign in to access your sweet account"
                  : "Register your colony and start selling honey products"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-100 rounded-[25px] p-1 flex">
                <button
                  onClick={() => !isLogin && toggleMode()}
                  className={`px-6 py-2 rounded-[20px] transition-all duration-300 bee-body-text-desktop font-medium ${
                    isLogin
                      ? "bg-brand text-primary shadow-md"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => isLogin && toggleMode()}
                  className={`px-6 py-2 rounded-[20px] transition-all duration-300 bee-body-text-desktop font-medium ${
                    !isLogin
                      ? "bg-brand text-primary shadow-md"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Colony Name Field - Only for Signup */}
              {!isLogin && (
                <div>
                  <label className="block bee-title-h6-desktop mb-2">
                    Colony Name *
                  </label>
                  <input
                    type="text"
                    value={formData.colonyName}
                    onChange={(e) =>
                      handleInputChange("colonyName", e.target.value)
                    }
                    placeholder="This is what sellers see you as"
                    className={`input w-full px-4 py-3 rounded-[15px] bee-body-text-desktop ${
                      errors.colonyName ? "border-accent" : ""
                    }`}
                  />
                  {errors.colonyName && (
                    <p className="text-accent bee-body-text-desktop text-sm mt-1">
                      {errors.colonyName}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block bee-title-h6-desktop mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className={`input w-full px-4 py-3 rounded-[15px] bee-body-text-desktop ${
                    errors.email ? "border-accent" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-accent bee-body-text-desktop text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block bee-title-h6-desktop mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your password"
                  className={`input w-full px-4 py-3 rounded-[15px] bee-body-text-desktop ${
                    errors.password ? "border-accent" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-accent bee-body-text-desktop text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field - Only for Signup */}
              {!isLogin && (
                <div>
                  <label className="block bee-title-h6-desktop mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your password"
                    className={`input w-full px-4 py-3 rounded-[15px] bee-body-text-desktop ${
                      errors.confirmPassword ? "border-accent" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-accent bee-body-text-desktop text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Messenger Link Field - Only for Signup */}
              {!isLogin && (
                <div>
                  <label className="block bee-title-h6-desktop mb-2">
                    Facebook Profile Link *
                  </label>
                  <input
                    type="url"
                    value={formData.messengerLink}
                    onChange={(e) =>
                      handleInputChange("messengerLink", e.target.value)
                    }
                    placeholder="https://www.facebook.com/your.username"
                    className={`input w-full px-4 py-3 rounded-[15px] bee-body-text-desktop ${
                      errors.messengerLink ? "border-accent" : ""
                    }`}
                  />
                  <p className="text-secondary bee-body-text-desktop text-sm mt-1">
                    Note: Go to your Facebook (Web) Profile Page and copy the
                    URL
                  </p>
                  {errors.messengerLink && (
                    <p className="text-accent bee-body-text-desktop text-sm mt-1">
                      {errors.messengerLink}
                    </p>
                  )}
                </div>
              )}

              {/* Terms and Conditions - Only for Signup */}
              {!isLogin && (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      handleInputChange("acceptTerms", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-brand border-2 border-secondary rounded focus:ring-brand focus:ring-2"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="bee-body-text-desktop flex-1"
                  >
                    I understand this is a research tool and consent to data
                    collection for research purposes.
                  </label>
                  <a
                    className="text-amber-500 mt-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsDataModalVisible(true)}
                  >
                    Learn more
                  </a>
                </div>
              )}

              {errors.acceptTerms && (
                <p className="text-accent bee-body-text-desktop text-sm">
                  {errors.acceptTerms}
                </p>
              )}

              {/* Forgot Password - Only for Login */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="bee-body-text-desktop text-brand hover:text-accent transition-colors cursor-pointer"
                  >
                    Forgot Password? 🤔
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-anim btn-primary w-full px-8 py-4 rounded-[15px] bee-button-desktop border-2 border-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isLogin ? "Signing In..." : "Creating Colony..."}
                    </span>
                  </div>
                ) : (
                  <span>
                    {isLogin ? "Sign In to Hive 🍯" : "Join the Hive 🐝"}
                  </span>
                )}
              </button>

              {/* Bottom Text */}
              <div className="text-center pt-4">
                <p className="bee-body-text-desktop text-secondary">
                  {isLogin
                    ? "Don't have a colony account? "
                    : "Already registered your colony? "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-brand hover:text-accent font-medium transition-colors"
                  >
                    {isLogin ? "Register Colony" : "Sign In"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
