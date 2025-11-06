// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import './Profile.css';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Updated testProfileConnection function
  const testProfileConnection = async () => {
    try {
      console.log('🧪 Testing profile connection...');
      
      // Test if server is reachable with a simple endpoint first
      try {
        const publicTest = await fetch('http://localhost:5001/api/profile/test');
        console.log('🌐 Server reachable, status:', publicTest.status);
        if (publicTest.ok) {
          const publicData = await publicTest.json();
          console.log('🌐 Public test data:', publicData);
        }
      } catch (publicError) {
        console.log('🌐 Server not reachable:', publicError.message);
      }
      
      // Test protected endpoint
      const token = localStorage.getItem('token');
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 Token:', token);
      
      if (!token) {
        console.log('❌ No token found in localStorage');
        throw new Error('No authentication token found');
      }

      console.log('📡 Testing protected profile endpoint...');
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Protected test error response:', errorText);
        
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Unauthorized - Invalid or expired token');
        } else if (response.status === 403) {
          throw new Error('Forbidden - No access to this resource');
        } else if (response.status === 404) {
          throw new Error('Endpoint not found');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ Full response data:', data);
      
      // Handle different response formats - same logic as fetchUserData
      let userData = null;
      
      if (data.success) {
        // Format 1: Has 'user' field
        if (data.user) {
          console.log('✅ Found user data in "user" field');
          userData = data.user;
        } 
        // Format 2: Has 'profile' field  
        else if (data.profile) {
          console.log('✅ Found user data in "profile" field');
          userData = data.profile;
        }
        // Format 3: User data is at root level
        else if (data.id && data.email) {
          console.log('✅ Found user data at root level');
          userData = data;
        }
        // Format 4: Check for nested data
        else if (data.data && data.data.user) {
          console.log('✅ Found user data in "data.user" field');
          userData = data.data.user;
        }
        else {
          console.log('❌ No recognizable user data structure found');
          throw new Error("No user data found in response. Available keys: " + Object.keys(data).join(', '));
        }
      } else {
        throw new Error(data.message || "Request was not successful");
      }
      
      console.log('✅ Extracted user data:', userData);
      
      // Return in the format expected by the component
      return {
        success: true,
        profile: userData,
        message: data.message || "Profile loaded successfully"
      };
      
    } catch (error) {
      console.error('❌ Test error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running on http://localhost:5001');
      } else if (error.message.includes('NetworkError')) {
        throw new Error('Network error. Check your internet connection and CORS settings');
      } else {
        throw error;
      }
    }
  };

  // Token validation helper
  const testTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      return false;
    }
    
    console.log('🔐 Token details:');
    console.log('  - Length:', token.length);
    console.log('  - Starts with:', token.substring(0, 20) + '...');
    
    // Try to decode JWT payload (if it's a JWT token)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('  - Payload:', payload);
      console.log('  - Expires:', new Date(payload.exp * 1000));
      console.log('  - User ID:', payload.userId || payload.id);
      return true;
    } catch (e) {
      console.log('  - Not a standard JWT token or cannot decode');
      return true; // Still might be valid, just not standard JWT
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('token');
      console.log('🔐 Token found:', !!token);
      
      if (!token) {
        setError("Please log in to view your profile");
        setLoading(false);
        navigate('/login');
        return;
      }

      console.log('📡 Fetching profile from: http://localhost:5001/api/profile');
      
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        setError("Session expired. Please log in again.");
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Profile data received:', data);
      
      // Handle both response formats
      if (data.success) {
        // If the response has 'user' field instead of 'profile'
        if (data.user) {
          setUser(data.user);
        } 
        // If the response has 'profile' field
        else if (data.profile) {
          setUser(data.profile);
        }
        // If user data is at the root level
        else if (data.id && data.email) {
          setUser(data);
        }
        else {
          throw new Error("User data not found in response: " + JSON.stringify(data));
        }
      } else {
        throw new Error(data.message || "Failed to load profile");
      }
      
    } catch (err) {
      console.error('💥 Fetch error:', err);
      setError("Failed to load profile: " + err.message);
      
      if (err.message.includes('Failed to fetch')) {
        setError("Cannot connect to server. Make sure the backend is running on port 5001.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRetry = () => {
    fetchUserData();
  };

  const handleManualTest = async () => {
    try {
      console.log('🔄 Starting manual test...');
      const result = await testProfileConnection();
      console.log('🎉 Manual test result:', result);
      
      if (result && result.profile) {
        setUser(result.profile);
        setError("");
        console.log('✅ Profile data set successfully');
      } else {
        setError("Test completed but no profile data received");
      }
    } catch (err) {
      console.error('❌ Manual test failed:', err);
      setError("Manual test failed: " + err.message);
    }
  };

  const handleTokenTest = () => {
    testTokenValidity();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && (
        <div className="message message-error">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <div className="button-group">
            <button onClick={handleRetry} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={handleManualTest} className="btn btn-outline">
              Debug Test
            </button>
            <button onClick={handleTokenTest} className="btn btn-outline">
              Check Token
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-secondary">
              Go to Login
            </button>
          </div>
        </div>
      )}

      {user && !error && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2>Welcome, {user.name}!</h2>
            <div className="profile-details">
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>User Type:</label>
                <span className="user-type">{user.user_type}</span>
              </div>
              <div className="detail-item">
                <label>User ID:</label>
                <span>{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && !error && !loading && (
        <div className="message message-info">
          <p>No user data found. Please try logging in again.</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;