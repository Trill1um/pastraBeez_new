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
    // safely extract fields from userData
    const {
      colonyName = "",
      email = "",
      password = "",
      confirmPassword = "",
      facebookLink = "",
      role = "buyer",
    } = userData || {};

    try {
      console.log("Signing up...");
      console.log("user: ", email, password);
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
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      console.log("logging in...");
      console.log("user: ", email, password);
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
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Login failed. Please try again later."
      );
    }
  },

  logout: async () => {
    try {
      await axios.post(`/auth/logout`);
      set({ user: null });

      // Clear React Query cache
      // if (typeof window !== "undefined") {
      //   import('../lib/query').then((mod) => {
      //     if (mod && mod.useInvalidateProducts) {
      //       mod.useInvalidateProducts().invalidateAll();
      //     }
      //   });
      // }

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
      console.log("Sending Verification Email...");
      const response = await axios.post(`/auth/verify-send`, {
        userEmail,
      });

      console.log(
        "Email verification response data from user store",
        response
      );
      
      toast.success("Email Verification Sent! Please verify your email. 🐝");
      set({ loading: false, coolDown: 120, isCodeSent: true });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Email verification failed. Please try again later."
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
      console.log("Checking verification code...", code, email);
      const response = await axios.post("/auth/verify-code", {
        code,
        email,
      });

      console.log(
        "Check email verification response data from user ",
        response
      );
      toast.success("Email verified successfully! 🐝");
      set({ loading: false, isVerifying: false });
      await get().checkAuth();
      return response.status;
    } catch (error) {
      set({ loading: false });
      console.log("From Store Error: ", error);
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
      console.log("Checking authentication status...");
      const response = await axios.get(`/auth/profile`);
      console.log("Authenticated user:", response.data);
      set({ isVerifying: false, user: response.data, checkingAuth: false });
    } catch {
      set({ user: null, checkingAuth: false });
    }
  },

  handleAuthFailure: () => {
    console.log("🔥 Auth failure detected, clearing user session");
    const currentUser = get().user;
    console.log("🔥 Handling auth failure for user:", currentUser);
    if (currentUser) {
      console.log("🚨 Auth failure detected, clearing user session");
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
    console.log("🔥 Auth-failed event received");
    useUserStore.getState().handleAuthFailure();
  });

  console.log("✅ Auth-failed event listener registered");
}