import React from "react";

const UserAvatar = ({ user, size = 32 }) => {
  // Get the first letter of the username
  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  // Check if user has a profile picture
  const hasProfilePicture = user?.profile?.profile_picture_url;

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hasProfilePicture ? "transparent" : "#000000",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: `${size / 2}px`,
    marginRight: "10px",
    overflow: "hidden",
    border: "2px solid #ffffff",
  };

  return (
    <div className="user-avatar" style={avatarStyle}>
      {hasProfilePicture ? (
        <img
          src={user.profile.profile_picture_url}
          alt={`${user.username}'s avatar`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        firstLetter
      )}
    </div>
  );
};

export default UserAvatar;
