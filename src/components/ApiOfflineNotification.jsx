import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const ApiOfflineNotification = () => {
  const [isApiDown, setIsApiDown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if API is down
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        
        if (response.ok) {
          setIsApiDown(false);
        } else {
          setIsApiDown(true);
        }
      } catch (error) {
        console.warn('API appears to be down:', error.message);
        setIsApiDown(true);
      }
    };

    checkApiStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isApiDown || dismissed) {
    return null;
  }

  return (
    <div className="api-offline-notification">
      <div className="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>API Connection Issue</strong> - You're currently viewing mock data because our backend API is unavailable. 
        Some features may be limited.
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setDismissed(true)}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default ApiOfflineNotification;
