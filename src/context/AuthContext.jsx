import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(getApiUrl("api/users/me/"));
      // Ensure profile data is properly structured
      const userData = response.data;
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(getApiUrl("api/users/login/"), {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        getApiUrl("api/users/register/"),
        userData
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
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
