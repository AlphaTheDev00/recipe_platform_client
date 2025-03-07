import { useState, useEffect } from "react";
import { checkApiStatus } from "../utils/api";

const ApiStatusIndicator = () => {
  const [isApiAvailable, setIsApiAvailable] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkApiStatus();
      setIsApiAvailable(status);
    };

    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isApiAvailable === null) return null; // Initial loading

  if (isApiAvailable) {
    return null; // Don't show anything when API is working
  }

  return (
    <div className="api-status-error">
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Server connection issue. Some features may be unavailable.
      </div>
    </div>
  );
};

export default ApiStatusIndicator;
