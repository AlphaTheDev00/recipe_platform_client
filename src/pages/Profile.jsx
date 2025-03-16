import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const fileInputRef = useRef(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Check for profile picture URL in different possible locations
      if (user.profile_picture_url) {
        setProfilePictureUrl(user.profile_picture_url);
      } else if (user.profile?.profile_picture_url) {
        setProfilePictureUrl(user.profile.profile_picture_url);
      }
    }
  }, [user]);
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, navigate, loading]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setProfilePictureUrl(URL.createObjectURL(file));
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate passwords match if either is provided
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }
    
    // Prepare form data for API
    const formDataObj = new FormData();
    formDataObj.append('username', formData.username);
    formDataObj.append('email', formData.email);
    
    // Add profile data
    const profileData = {
      bio: formData.bio
    };
    formDataObj.append('profile', JSON.stringify(profileData));
    
    // Add password if provided
    if (formData.newPassword) {
      formDataObj.append('password', formData.newPassword);
    }
    
    // Add profile picture if exists
    if (profilePicture) {
      formDataObj.append('profile_picture', profilePicture);
      // Also append the profile picture with the correct field name for the backend
      formDataObj.append('profile.profile_picture', profilePicture);
    }
    
    try {
      // Update user profile data with all changes at once
      const result = await updateProfile(formDataObj);
      
      if (result.success) {
        setSuccess('Profile updated successfully');
        // Clear password fields after successful update
        setFormData({
          ...formData,
          newPassword: '',
          confirmPassword: '',
        });
        // Clear file input
        setProfilePicture(null);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };
  
  // Generate initials for avatar
  const getInitials = () => {
    if (!user || !user.username) return '';
    return user.username.charAt(0).toUpperCase();
  };
  
  if (!user) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm mt-4 mb-4">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div 
                  className="avatar-circle mx-auto mb-3"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#333',
                    backgroundImage: profilePictureUrl ? `url(${profilePictureUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={handleAvatarClick}
                >
                  {!profilePictureUrl && getInitials()}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      textAlign: 'center',
                      padding: '2px',
                      fontSize: '0.7rem'
                    }}
                  >
                    Change
                  </div>
                </div>
                <h2 className="mb-3">Profile Settings</h2>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <input
                    type="text"
                    className="form-control"
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Food enthusiast and home cook"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="d-flex justify-content-end mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-dark"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
