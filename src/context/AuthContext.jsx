import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { getApiUrl, API_BASE_URL } from "../utils/api"; // Ensure API_BASE_URL is imported
import { safeStorage } from "../utils/storage";
import memoryStorage from "../utils/memoryStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(safeStorage.getItem("token", null));
  const [loading, setLoading] = useState(true);

  // Setup Axios defaults
  useEffect(() => {
    // Set up default headers for all requests
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    // Set Authorization header when token exists
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    // Add request interceptor for CORS issues
    axios.interceptors.request.use(
      (config) => {
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Axios error interceptor:", error);
        // Handle specific errors here
        return Promise.reject(error);
      }
    );
  }, [token]);

  // Check for existing user on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(getApiUrl("api/users/me/"));
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If token is invalid, clear it
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log("Login attempt with credentials:", {
        username: credentials.username,
        password: credentials.password ? "***" : "missing",
      });

      // Use the direct API_BASE_URL for authentication
      const response = await fetch(`${API_BASE_URL}/api-token-auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      const data = await response.json();

      // Safely store token
      try {
        safeStorage.setItem("token", data.token);
      } catch (e) {
        console.warn("Cannot store in localStorage, using memory storage", e);
      }

      // Always save to memory storage
      memoryStorage.setItem("token", data.token);
      setToken(data.token);

      // Set user
      setUser({ username: credentials.username });

      return { success: true };
    } catch (error) {
      console.error("Login process error:", error);
      return {
        success: false,
        error: "Server error. Please try again later.",
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Registering user:", userData.username);
      const response = await axios.post(
        getApiUrl("api/users/register/"),
        userData
      );

      console.log("Registration response:", response.data);
      const { token, user_id, email } = response.data;

      // Save token in local storage
      safeStorage.setItem("token", token);
      setToken(token);

      // Set axios authorization header immediately
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;

      // Set basic user info from response
      setUser({ id: user_id, email, username: userData.username });

      // Fetch complete user profile
      await fetchUserProfile();

      return { success: true };
    } catch (error) {
      console.error("Registration error details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      return {
        success: false,
        error:
          error.response?.data?.username?.[0] ||
          error.response?.data?.email?.[0] ||
          error.response?.data?.password?.[0] ||
          "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    safeStorage.removeItem("token");
    memoryStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      const response = await axios.get(getApiUrl("api/users/me/"));
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateProfile = async (userData) => {
    try {
      // Check if userData contains a File object (for profile picture)
      const containsFile =
        userData.profile && userData.profile.profile_picture instanceof File;

      let response;
      if (containsFile) {
        // If there's a file, use FormData
        const formData = new FormData();

        // Add non-file data
        for (const key in userData) {
          if (key !== "profile") {
            formData.append(key, userData[key]);
          }
        }

        // Add profile data except the file
        const profileData = { ...userData.profile };
        delete profileData.profile_picture;
        formData.append("profile", JSON.stringify(profileData));

        // Add the file
        formData.append(
          "profile.profile_picture",
          userData.profile.profile_picture
        );

        // Use getApiUrl instead of hardcoded URL
        response = await axios.put(
          getApiUrl("api/users/update_profile/"),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Regular JSON request
        // Use getApiUrl instead of hardcoded URL
        response = await axios.put(
          getApiUrl("api/users/update_profile/"),
          userData
        );
      }

      // Fetch the updated user data to ensure we have the latest profile picture URL
      await fetchUserProfile();

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
