import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState('Loading...');
  const [loginStatus, setLoginStatus] = useState('Not tested');
  const [registerStatus, setRegisterStatus] = useState('Not tested');
  const [recipesStatus, setRecipesStatus] = useState('Not tested');
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);

  useEffect(() => {
    testHealthEndpoint();
  }, []);

  const testHealthEndpoint = async () => {
    try {
      setHealthStatus('Testing...');
      const response = await fetch(`${API_BASE_URL}/api/health/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(`Success (${response.status}): ${JSON.stringify(data)}`);
      } else {
        setHealthStatus(`Failed (${response.status}): ${await response.text()}`);
      }
    } catch (error) {
      setHealthStatus(`Error: ${error.message}`);
    }
  };

  const testLoginEndpoint = async () => {
    try {
      setLoginStatus('Testing...');
      const response = await fetch(`${API_BASE_URL}/api-token-auth/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          username: 'user1',
          password: 'password123'
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoginStatus(`Success (${response.status}): Token received`);
      } else {
        setLoginStatus(`Failed (${response.status}): ${await response.text()}`);
      }
    } catch (error) {
      setLoginStatus(`Error: ${error.message}`);
    }
  };

  const testRegisterEndpoint = async () => {
    try {
      setRegisterStatus('Testing...');
      const randomSuffix = Math.floor(Math.random() * 10000);
      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          username: `testuser${randomSuffix}`,
          email: `test${randomSuffix}@example.com`,
          password: 'password123'
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegisterStatus(`Success (${response.status}): Token received`);
      } else {
        setRegisterStatus(`Failed (${response.status}): ${await response.text()}`);
      }
    } catch (error) {
      setRegisterStatus(`Error: ${error.message}`);
    }
  };

  const testRecipesEndpoint = async () => {
    try {
      setRecipesStatus('Testing...');
      const response = await fetch(`${API_BASE_URL}/api/recipes/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecipesStatus(`Success (${response.status}): Found ${data.length} recipes`);
      } else {
        setRecipesStatus(`Failed (${response.status}): ${await response.text()}`);
      }
    } catch (error) {
      setRecipesStatus(`Error: ${error.message}`);
    }
  };

  const updateApiUrl = () => {
    try {
      localStorage.setItem('custom_api_url', apiUrl);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update API URL:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>API Connection Test</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>API Configuration</h2>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Current API URL:</label>
            <input 
              type="text" 
              className="form-control" 
              value={apiUrl} 
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>
          <button className="btn btn-warning" onClick={updateApiUrl}>
            Update API URL
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Health Check</h2>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {healthStatus}</p>
          <button className="btn btn-primary" onClick={testHealthEndpoint}>
            Test Health Endpoint
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Login Test</h2>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {loginStatus}</p>
          <button className="btn btn-primary" onClick={testLoginEndpoint}>
            Test Login (user1/password123)
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Registration Test</h2>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {registerStatus}</p>
          <button className="btn btn-primary" onClick={testRegisterEndpoint}>
            Test Registration
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Recipes Test</h2>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {recipesStatus}</p>
          <button className="btn btn-primary" onClick={testRecipesEndpoint}>
            Test Recipes Endpoint
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
