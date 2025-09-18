import { create } from 'zustand';
import toast from 'react-hot-toast';
import axios from '../lib/axios'; // Adjust the import path as necessary

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signUp: async (colonyName, email, password, confirmPassword, facebookLink) => {
    set({loading: true});
    if (password !== confirmPassword) {
      set({loading: false});
      return toast.error('Passwords do not match');
    }
    try {
        const response = await axios.post(`/auth/signup`, {
          colonyName,
          email,
          password,
          facebookLink,
          confirmPassword
        });
        set({user: response.data, loading: false});
        console.log("Signup response data from user store", response.data);
        toast.success('Welcome to PastraBeez! Colony registered successfully! 🐝');
        await get().checkAuth();
    } catch (error) {   
        set({loading: false});
        toast.error(error.message || 'Sign up failed. Please try again later.');
    }
  },

  login: async (email, password) => {
    set({loading: true});

    try {
        const response = await axios.post(`/auth/login`, {
          email,
          password,
        });
        
        set({user: response.data, loading: false});
        console.log('Login response data from user store:', response.data);
        toast.success('Welcome back to the hive! 🍯');
        await get().checkAuth();
    } catch (error) {
        set({loading: false});
        toast.error(error.response.data.message || 'Login failed. Please try again later.');
    }
  },

  logout: async () => {
    try {
        await axios.post(`/auth/logout`);
        set({user: null});
        toast.success('Logged out successfully');
    } catch(error) {
      console.error(error);
      toast.error('Logout failed');
    }
  },

  checkAuth: async () => {
    set({checkingAuth: true});
    try {
        console.log('Checking authentication status...');
        const response = await axios.get(`/auth/profile`);
        console.log('Authenticated user:', response.data);
        set({user: response.data, checkingAuth: false});
    } catch {
        set({user: null, checkingAuth: false});
    }
  },

  handleAuthFailure: () => {
    console.log('🔥 Auth failure detected, clearing user session');
      const currentUser = get().user;
      console.log('🔥 Handling auth failure for user:', currentUser);
    if (currentUser) {
      console.log('🚨 Auth failure detected, clearing user session');
      set({ user: null, loading: false, checkingAuth: false });

      toast.error('Session expired. Please log in again.');
      
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = '/authenticate';
      }, 2000);
    } else {
      toast.success('Welcome to PastraBeez! Enjoy exploring the hive 🐝');
    }
  }
}));

// Listen for auth failure events OUTSIDE the store creation
if (typeof window !== 'undefined') {
  // Set up event listener when module loads
  window.addEventListener('auth-failed', () => {
    console.log('🔥 Auth-failed event received');
    useUserStore.getState().handleAuthFailure();
  });
  
  console.log('✅ Auth-failed event listener registered');
} 