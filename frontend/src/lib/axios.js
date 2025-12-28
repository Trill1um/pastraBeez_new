import axios from "axios";
import toast from "react-hot-toast";

const baseURL =
  (import.meta.env.VITE_API_PRODUCTION_URL ||
    import.meta.env.VITE_API_DEVELOPMENT_URL) + "/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
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
    config.__startTime = Date.now();
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
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
    toast.success(`Time: ${(Date.now() - response.config?.__startTime)||-1}ms or ${((Date.now() - (response.config?.__startTime||Date.now()))/1000)}s | ${response.status||-1} ${response.config?.url||-1}`, { duration: 30000 });
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
        // console.log("❌ Refresh token expired, redirecting to login");
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
        // console.log("🔄 Access token expired, trying to refresh...");
        await axiosInstance.post("/auth/refresh-token");
        // console.log("✅ Token refreshed successfully");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // console.log("❌ Token refresh failed, redirecting to login");
        processQueue(refreshError);
        window.dispatchEvent(new Event("auth-failed"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const duration = error.config?.__startTime ? Date.now() - error.config.__startTime : 'unknown';
    console.error(
      `❌ API Error: ${error.response?.status || error.code} ${error.config?.url} (${duration}ms)`,
      {
        message: error.message,
        code: error.code,
        isTimeout: error.code === 'ECONNABORTED',
        responseData: error.response?.data?.message || error.response?.data
      }
    );
    toast.error(`Time: ${duration||-1}ms or ${duration/1000}||-1}s | ${error.response?.status|| error.code || -1} ${error.config?.url || -1}`, { duration: 30000 });
    return Promise.reject(error);
  }
);

export default axiosInstance;
