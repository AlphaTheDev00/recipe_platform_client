import React from "react";
import { getApiUrl } from "../utils/api";

const ProfileImage = ({ user }) => {
  // Enhanced profile picture URL handling for production
  const getProfileImageUrl = () => {
    if (!user) return null;

    // Case 1: Full URL already provided
    if (user?.profile?.profile_picture_url) {
      return user.profile.profile_picture_url;
    }

    // Case 2: Relative path that needs API base URL
    if (user?.profile?.profile_picture) {
      // Check if it's already a full URL
      if (user.profile.profile_picture.startsWith("http")) {
        return user.profile.profile_picture;
      }
      // Otherwise, prepend the API URL
      return getApiUrl(`media/${user.profile.profile_picture}`);
    }

    return null;
  };

  const profilePicUrl = getProfileImageUrl();

  return (
    <div className="profile-image-container">
      {profilePicUrl ? (
        <img
          src={profilePicUrl}
          alt={`${user.username}'s profile`}
          className="profile-image"
          onError={(e) => {
            console.error("Error loading profile image:", e);
            e.target.src = "/default-avatar.png"; // Fallback image
            e.target.onerror = null; // Prevent infinite loop
          }}
        />
      ) : (
        <div className="profile-initial">
          {user.username ? user.username.charAt(0).toUpperCase() : "?"}
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
