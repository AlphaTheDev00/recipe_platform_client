import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/api"; // Import the API utility
import { safeStorage } from "../utils/storage";

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
      console.log("Login attempt with:", credentials.username);
      console.log("API URL:", getApiUrl("api-token-auth/"));        password: credentials.password ? "***" : "missing"

      // Use getApiUrl instead of hardcoded URL"api-token-auth/"));
      const response = await axios.post(
        getApiUrl("api-token-auth/"),edentials before sending
        credentials,(!credentials.username || !credentials.password) {
        {
          headers: {
            "Content-Type": "application/json",ror: "Username and password are required."
          },;
        }
      );      

      console.log("Login response:", response.data);t(
      const { token } = response.data;        getApiUrl("api-token-auth/"),

      // Save token in local storage
      safeStorage.setItem("token", token);edentials.password
      setToken(token);        },

      // Set the token in axios headers immediately
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;            'Content-Type': 'application/json',

      // Fetch user profile
      const userResponse = await axios.get(getApiUrl("api/users/me/"));
      setUser(userResponse.data);
se received:", response.status);
      return { success: true }; = response.data;
    } catch (error) {
      console.error("Login error details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data); setToken(token);
      }
      return {n in axios headers immediately
        success: false,defaults.headers.common["Authorization"] = `Token ${token}`;
        error:
          error.response?.data?.non_field_errors?.[0] ||
          "Login failed. Please check your credentials.",// Continue with the token in memory even if localStorage fails
      }; }
    }
  };      // Fetch user profile

  const register = async (userData) => {onst userResponse = await axios.get(getApiUrl("api/users/me/"));
    try {
      console.log("Registering user:", userData.username);
      const response = await axios.post(r profile:", profileError);
        getApiUrl("api/users/register/"),n still return success since login worked
        userData
      );

      console.log("Registration response:", response.data);
      const { token, user_id, email } = response.data;      console.error("Login error details:", error);

      // Save token in local storagerror.response.status);
      safeStorage.setItem("token", token);"Response data:", error.response.data);
      setToken(token);      }

      // Set axios authorization header immediately
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;        error:
errors?.[0] ||
      // Set basic user info from response
      setUser({ id: user_id, email, username: userData.username });      };

      // Fetch complete user profile
      await fetchUserProfile();
ata) => {
      return { success: true };
    } catch (error) {
      console.error("Registration error details:", error);t axios.post(
        getApiUrl("api/users/register/"),
        userDataus);
      ); console.error("Response data:", error.response.data);

      console.log("Registration response:", response.data);
      const { token, user_id, email } = response.data;s: false,

      // Save token in local storage ||
      localStorage.setItem("token", token);
      setToken(token);
  "Registration failed. Please try again.",
      // Set axios authorization header immediately };
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;}
  };
      // Set basic user info from response
      setUser({ id: user_id, email, username: userData.username });
oveItem("token");
      // Fetch complete user profile;
      await fetchUserProfile();setUser(null);
    delete axios.defaults.headers.common["Authorization"];
      return { success: true };
    } catch (error) {
      console.error("Registration error details:", error);  const fetchUserProfile = async () => {
      if (error.response) {token) return;
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }d of hardcoded URL
      return {= await axios.get(getApiUrl("api/users/me/"));
        success: false,
        error: catch (error) {
          error.response?.data?.username?.[0] ||  console.error("Error fetching user profile:", error);
          error.response?.data?.email?.[0] ||    }
          error.response?.data?.password?.[0] ||
          "Registration failed. Please try again.",
      };
    }
  };
      const containsFile =
  const logout = () => {ofile && userData.profile.profile_picture instanceof File;
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };        // If there's a file, use FormData
 FormData();
  const fetchUserProfile = async () => {
    if (!token) return;

    try {f (key !== "profile") {
      // Use getApiUrl instead of hardcoded URL   formData.append(key, userData[key]);
      const response = await axios.get(getApiUrl("api/users/me/"));          }
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };        delete profileData.profile_picture;
("profile", JSON.stringify(profileData));
  const updateProfile = async (userData) => {
    try {
      // Check if userData contains a File object (for profile picture)
      const containsFile ="profile.profile_picture",
        userData.profile && userData.profile.profile_picture instanceof File;          userData.profile.profile_picture

      let response;
      if (containsFile) {
        // If there's a file, use FormDataawait axios.put(
        const formData = new FormData();etApiUrl("api/users/update_profile/"),

        // Add non-file data
        for (const key in userData) {aders: {
          if (key !== "profile") {   "Content-Type": "multipart/form-data",
            formData.append(key, userData[key]);  },
          }
        }

        // Add profile data except the file
        const profileData = { ...userData.profile };
        delete profileData.profile_picture; await axios.put(
        formData.append("profile", JSON.stringify(profileData));getApiUrl("api/users/update_profile/"),
   userData
        // Add the file        );
        formData.append(
          "profile.profile_picture",
          userData.profile.profile_picture      // Fetch the updated user data to ensure we have the latest profile picture URL
        );

        // Use getApiUrl instead of hardcoded URL
        response = await axios.put(rror) {
          getApiUrl("api/users/update_profile/"),ofile update error:", error);
          formData,
          {success: false,
            headers: {   error: error.response?.data?.message || "Profile update failed",
              "Content-Type": "multipart/form-data",  };
            },    }
          }
        );
      } else {lue = {
        // Regular JSON request
        // Use getApiUrl instead of hardcoded URL
        response = await axios.put(
          getApiUrl("api/users/update_profile/"),
          userData
        );logout,
      }    updateProfile,

      // Fetch the updated user data to ensure we have the latest profile picture URL
      await fetchUserProfile();
alue={value}>
      return { success: true };  {!loading && children}
    } catch (error) {  </AuthContext.Provider>
      console.error("Profile update error:", error);  );
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",uth = () => {
      };
    }f (!context) {
  };or("useAuth must be used within an AuthProvider");
}
  const value = {  return context;
    user,
    token,
























export default AuthContext;};  return context;  }    throw new Error("useAuth must be used within an AuthProvider");  if (!context) {  const context = useContext(AuthContext);export const useAuth = () => {};  );    </AuthContext.Provider>      {!loading && children}    <AuthContext.Provider value={value}>  return (  };    updateProfile,    logout,    register,    login,    loading,export default AuthContext;
