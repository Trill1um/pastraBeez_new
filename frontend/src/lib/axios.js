import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_PRODUCTION_URL ||
    import.meta.env.VITE_API_DEVELOPMENT_URL) + "/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh on login failure
    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // Case: refresh token doesn't exist then skip
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      if (error.response?.status === 401) {
        console.log("❌ Refresh token expired, redirecting to login");
        window.dispatchEvent(new Event("auth-failed"));
      }
      return Promise.reject(error);
    }

    // If we get 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Access token expired, trying to refresh...");
        await axiosInstance.post("/auth/refresh-token");
        console.log("✅ Token refreshed successfully");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("❌ Token refresh failed, redirecting to login");
        processQueue(refreshError);
        window.dispatchEvent(new Event("auth-failed"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (import.meta.env.MODE === "development") {
      console.error(
        `❌ API Error: ${error.response?.status} ${error.config?.url}`,
        error.response?.data.message || error.response?.data 
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
