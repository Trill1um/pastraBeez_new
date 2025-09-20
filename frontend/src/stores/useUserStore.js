import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // Adjust the import path as necessary
import { persist } from "zustand/middleware";


export const useUserStore = create(
  persist((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    tempUser: null,
    isVerifying: false,

    setVerificationProgress: (progress) => {
      set({ isVerifying: progress });
    },

    cancelVerification: () => {
      if (!get().isVerifying) {
        useUserStore.persist.clearStorage();
      }
    },

    signUp: async (
      colonyName,
      email,
      password,
      confirmPassword,
      facebookLink
    ) => {
      set({ loading: true });
      if (password !== confirmPassword) {
        set({ loading: false });
        return toast.error("Passwords do not match");
      }
      try {
        const response = await axios.post(`/auth/signup`, {
          colonyName,
          email,
          password,
          facebookLink,
          confirmPassword,
        });
        console.log("Signup response data from user store", response.data);
        // toast.success("Welcome to PastraBeez! Colony registered successfully! 🐝");
        await get().login(email, password);
      } catch (error) {
        set({ loading: false });
        toast.error(error.message || "Sign up failed. Please try again later.");
      }
    },

    debugVerification: async (email) => {
      console.log("Debug verification for email:", email);
      try {
        const response = await axios.post(`/auth/debug-verify`, { email });
        console.log("Debug verification response:", response.data);
      } catch (error) {
        console.error("Debug verification error:", error);
      }
    },

    login: async (email, password) => {
      set({ loading: true });
      try {
        console.log("logging in...");
        const response = await axios.post(`/auth/login`, {
          email,
          password,
        });

        set({
          user: response.data,
          loading: false,
          tempUser: null,
          isVerifying: false,
        });
        get().cancelVerification();
        toast.success("Welcome to the hive! 🍯");

        await get().checkAuth();
      } catch (error) {
        console.log("Login error:", error);
        set({ loading: false });
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data.message === "Not verified"
        ) {
          set({
            tempUser: {
              email: email,
              password: password,
            },
            isVerifying: true,
          });
          toast.error("Please verify your email before logging in.");
          return;
        }
        toast.error(
          error.response.data.message || "Login failed. Please try again later."
        );
      }
    },

    logout: async () => {
      try {
        await axios.post(`/auth/logout`);
        set({ user: null });
        toast.success("Logged out successfully");
      } catch (error) {
        console.error(error);
        toast.error("Logout failed");
      }
    },

    sendVerifyEmail: async () => {
      set({ loading: true });
      try {
        if (!get().tempUser || !get().tempUser.email) {
          set({ loading: false });
          return;
        };
        console.log("Sending Verification Email...");
        const response = await axios.post(`/auth/verify-send`, {
          tempUser: get().tempUser,
        });

        console.log(
          "Email verification response data from user store",
          response.data.message
        );
        toast.success("Email Verification Sent! 🐝");
        set({ loading: false });
      } catch (error) {
        set({ loading: false });
        toast.error(
          error.message || "Email verification failed. Please try again later."
        ); 
      }
    },

    checkVerifyEmail: async (token, email) => {
      set({ loading: true });
      try {
        const response = await axios.post("/auth/verify-receive", {
          token,
          email,
        });

        console.log(
          "Check email verification response data from user store",
          response.data
        );
        toast.success("Email verified successfully! 🐝");
        set({ loading: false, isVerifying: false });
      } catch (error) {
        set({ loading: false });
        console.log("From Store Erro: ", error)
        toast.error(
          error.response?.data.message || "Email verification failed. Please try again later."
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
  }), {
    name: "user-storage",
    partialize: (state) => ({
      isVerifying: state.isVerifying,
    }),
  })
);

// Listen for auth failure events OUTSIDE the store creation
if (typeof window !== "undefined") {
  // Set up event listener when module loads
  window.addEventListener("auth-failed", () => {
    console.log("🔥 Auth-failed event received");
    useUserStore.getState().handleAuthFailure();
  });

  // Sync Zustand state across tabs when localStorage changes
  window.addEventListener("storage", (event) => {
    if (event.key === "user-storage") {
      useUserStore.persist.rehydrate();
    }
  });

  console.log("✅ Auth-failed event listener registered");
  console.log("✅ Zustand cross-tab sync listener registered");
}
