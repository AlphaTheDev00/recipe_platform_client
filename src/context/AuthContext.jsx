import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/api"; // Import the API utility

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
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
      // Use getApiUrl instead of hardcoded URL
      const response = await axios.post(
        getApiUrl("api-token-auth/"),
        credentials
      );

      const { token } = response.data;

      // Save token in local storage
      localStorage.setItem("token", token);
      setToken(token);

      // Fetch user profile
      const userResponse = await axios.get(getApiUrl("api/users/me/"));
      setUser(userResponse.data);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.non_field_errors?.[0] ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  const register = async (userData) => {
    try {
      // Use getApiUrl instead of hardcoded URL
      const response = await axios.post(
        getApiUrl("api/users/register/"),
        userData
      );

      const { token, user_id, email } = response.data;

      // Save token in local storage
      localStorage.setItem("token", token);
      setToken(token);

      // Set basic user info from response
      setUser({ id: user_id, email, username: userData.username });

      // Fetch complete user profile
      await fetchUserProfile();

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
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
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      // Use getApiUrl instead of hardcoded URL
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
