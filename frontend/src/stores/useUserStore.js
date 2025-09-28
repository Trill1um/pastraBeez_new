import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // Adjust the import path as necessary

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  tempEmail: null,
  isVerifying: false,
  isOnCooldown: false,
  isPolling: false,

  cancelPolling: () => {
    set({ isPolling: false });
  },

  setVerificationProgress: (progress) => {
    set({ isVerifying: progress });
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
      console.log("Signing up...");
      console.log("user: ",  email, password);
      const response = await axios.post(`/auth/signup`, {
        colonyName,
        email,
        password,
        facebookLink,
        confirmPassword,
      });
      console.log("Stored Temp to redis: ", response);
      set({ loading: false, isVerifying: true, tempEmail: email });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.message || "Sign up failed. Please try again later.");
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

  polling: async () => {
    try {
      set({ loading: true, isPolling: true });
      const maxAttempsts=60;
      let pollingAttempts=0;
      const email=get().tempEmail;
      const intervalId = async () => {
        if (pollingAttempts >= maxAttempsts || !get().isPolling) {
          set({ loading: false });
          toast.error("Verification timed out. Please try logging in again.");
          clearInterval(intervalId);
          return;
        }
        console.log("Polling for user verification...");
        const response = await axios.post(`/auth/polling`, { email });
        console.log("Polling response:", response);
        if (response.data.verified) {
          clearInterval(intervalId);
          await get().login(response.data.credentials.email, response.data.credentials.password);
          console.log("User verified, triggered logging in");
        } else {
          let interval;
          switch(true) {
            case (pollingAttempts <= 15):
              interval = 5000; // 5 seconds
              break;
            case (pollingAttempts <= 30):
              interval = 10000; // 10 seconds
              break;
            default:
              interval = 30000; // 30 seconds
          }
          setTimeout(intervalId, interval);
          pollingAttempts++;
        }
      }; // Poll every 5 seconds
      intervalId();
      set({ loading: false });
    } catch(error) {
      set({ loading: false, isPolling: false });
      console.error(error);
      toast.error(error.message || "Polling error");
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
      toast.success("Email Verification Sent! 🐝");
      set({ loading: false, isOnCooldown: true });
      await get().polling();
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
        "Check email verification response data from user ",
        response
      );
      toast.success("Email verified successfully! 🐝");
      set({ loading: false, isVerifying: false });
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
