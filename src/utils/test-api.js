// Test script for API connection
import { API_BASE_URL } from './api';

async function testApiConnection() {
  console.log('Testing API connection...');
  console.log('API_BASE_URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/api/health/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    } else {
      console.error('Health check failed:', await healthResponse.text());
    }
    
    // Test login endpoint
    const loginResponse = await fetch(`${API_BASE_URL}/api-token-auth/`, {
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
    
    console.log('Login status:', loginResponse.status);
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
    } else {
      console.error('Login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('API test error:', error);
  }
}

// Export the test function
export default testApiConnection;
