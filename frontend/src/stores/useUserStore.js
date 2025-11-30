import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // Adjust the import path as necessary

let _cooldownTimer = null;
export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  tempEmail: null,
  isVerifying: false,
  coolDown: 0,
  isCodeSent: false,
  invalidateProducts: null, 

  setInvalidateAll: (fn) => {
    set({ invalidateProducts: fn });
  },

  setVerificationProgress: (progress) => {
    set({ isVerifying: progress });
  },

  startCountDown: (seconds = 120) => {
    // clear any existing timer
    if (_cooldownTimer) {
      clearInterval(_cooldownTimer);
      _cooldownTimer = null;
    }

    if (!seconds || seconds <= 0) {
      set({ coolDown: 0 });
      return;
    }

    // initialize state immediately
    set({ coolDown: seconds });

    _cooldownTimer = setInterval(() => {
      set((state) => {
        if (state.coolDown <= 1) {
          clearInterval(_cooldownTimer);
          _cooldownTimer = null;
          return { coolDown: 0 };
        }
        return { coolDown: state.coolDown - 1 };
      });
    }, 1000);
  },

  signUp: async (userData) => {
    set({ loading: true });
    if (userData?.password !== userData?.confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    if (userData?.acceptTerms !== true) {
      set({ loading: false });
      return toast.error("You must accept the terms and conditions to sign up.");
    }
    const {
      colonyName = "",
      email = "",
      password = "",
      confirmPassword = "",
      facebookLink = "",
      role = "buyer",
    } = userData || {};

    try {
      const response = await axios.post(`/auth/signup`, {
        colonyName,
        email,
        password,
        facebookLink,
        confirmPassword,
        role,
      });
      set({ loading: false, isVerifying: true, tempEmail: email });
      toast.success(response?.data?.message || "Sign up successful! Please verify your email. 🐝");
    } catch (error) {
      set({ loading: false });
      console.error("Sign up error:", error);
      toast.error(
        error.response?.data.message || "Sign up failed. Please try again later."
      );
      toast.error(
        error, {autoClose: 10000}
      )
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post(`/auth/login`, {
        email,
        password,
      });

      set({
        user: response.data,
        loading: false,
      });
      toast.success("Welcome to the hive! 🍯");
      await get().checkAuth();
    } catch (error) {
      console.error("Login error:", error);
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Login failed. Please try again later."
      );
      toast.error(
        error, {autoClose: 10000}
      )
    }
  },

  logout: async () => {
    try {
      await axios.post(`/auth/logout`);
      set({ user: null, isinValidateProducts: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  },

  sendVerifyEmail: async () => {
    set({ loading: true });
    try {
      const userEmail = get().tempEmail;
      if (get().coolDown) {
        throw new Error(`Please wait ${get().coolDown} seconds before requesting a new code.`);
      }

      const response = await axios.post(`/auth/verify-send`, {userEmail});
      
      toast.success("Email Verification Sent! Please verify your email. 🐝");
      set({ loading: false, coolDown: 120, isCodeSent: true });
      return response.status;
    } catch (error) {
      console.error("Error sending: ", error);
      set({ loading: false});
      toast.error(
        error.response?.data.message || error.message || "Email verification failed. Please try again later."
      );
    }
  },

  cancelVerification: async (email) => {
    try {
      set({ loading: true });
      await axios.post(`/auth/verify-cancel`, { email });
      set({ loading: false, isVerifying: false, tempEmail: null, isCodeSent: false, coolDown: 0 });
      toast.success("Verification cancelled");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.message || "Failed to cancel verification");
      throw error;
    }
  },

  checkCode: async (code, email) => {
    set({ loading: true });
    try {
      const response = await axios.post("/auth/verify-code", {
        code,
        email,
      });

      toast.success("Email verified successfully! 🐝");
      set({ loading: false, isVerifying: false });
      await get().checkAuth();
      return response.status;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message ||
          "Email verification failed. Please try again later."
      );
      return error.status;
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get(`/auth/profile`);
      set({ isVerifying: false, user: response.data, checkingAuth: false });
      if (get().invalidateProducts) {
        get().invalidateProducts();
      }
    } catch {
      set({ user: null, checkingAuth: false });
    }
  },

  handleAuthFailure: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: null, loading: false, checkingAuth: false });
  
      toast.error("Session expired. Please log in again.");
  
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = "/authenticate";
      }, 2000);
    } else {
      toast.success("Welcome to PastraBeez! Enjoy exploring the hive 🐝");
    }
  },
}));

// Listen for auth failure events OUTSIDE the store creation
if (typeof window !== "undefined") {
  // Set up event listener when module loads
  window.addEventListener("auth-failed", () => {
    // console.log("🔥 Auth-failed event received");
    useUserStore.getState().handleAuthFailure();
  });
  // console.log("✅ Auth-failed event listener registered");
}