import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaKey, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../services/AuthService';

export const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // User data state
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Form data state for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Password form data
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data from backend API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get user ID and token using AuthService
        const token = AuthService.getToken();
        const userInfo = AuthService.getUserInfo();
        
        if (!userInfo.id) {
          throw new Error('User ID not found in session storage');
        }

        // Set authorization header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch user data from backend with auth header
        const response = await axios.get(`http://localhost:3200/user/${userInfo.id}`, config);
        
        if (response.status === 200) {
          const userData = response.data.data || {};
          
          // Update user data with API response
          const updatedUserData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
          };
          
          setUserData(updatedUserData);
          setFormData(updatedUserData);
          
          // Update auth data with fresh data
          AuthService.setAuthData({
            ...userInfo,
            firstName: updatedUserData.firstName,
            lastName: updatedUserData.lastName,
            email: updatedUserData.email
          });
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Fallback to AuthService if API fails
        const userInfo = AuthService.getUserInfo();
        
        const profileData = {
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          email: userInfo.email || '',
          phone: ''
        };
        
        setUserData(profileData);
        setFormData(profileData);
        setErrorMessage('Could not fetch latest profile data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - revert form data to user data
      setFormData(userData);
    }
    setIsEditing(!isEditing);
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Get user ID and token using AuthService
      const token = AuthService.getToken();
      const userInfo = AuthService.getUserInfo();
      
      if (!userInfo.id) {
        throw new Error('User ID not found in session storage');
      }

      // Set authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Send updated profile data to backend with auth header
      const response = await axios.put(`http://localhost:3200/user/${userInfo.id}`, formData, config);
      
      if (response.status === 200) {
        // Update userData with formData
        setUserData(formData);
        
        // Update auth data
        AuthService.setAuthData({
          ...userInfo,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        });
        
        setIsEditing(false);
        setSaveSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Validate passwords
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // Get user ID and token using AuthService
      const token = AuthService.getToken();
      const userInfo = AuthService.getUserInfo();
      
      if (!userInfo.id) {
        throw new Error('User ID not found in session storage');
      }

      // Now use ApiService instead of direct axios call
      const response = await axios.post('http://localhost:3200/user/updatepassword', {
        userId: userInfo.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setSaveSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage(error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'none' }}></div>;
  }

  return (
    <div className="container-fluid p-0">
      {/* Success message at the top */}
      {saveSuccess && (
        <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
          <FaCheckCircle className="me-2" />
          <div>Profile updated successfully!</div>
        </div>
      )}
      
      <div className="row">
        <div className="col-12">
          {/* Profile Information */}
          <div className="user-card mb-4">
            <div className="user-card-header d-flex justify-content-between align-items-center">
              <h5 className="user-card-title mb-0">Profile Information</h5>
              <button 
                onClick={handleEditToggle}
                className={`user-btn ${isEditing ? 'user-btn-light' : 'user-btn-outline-primary'}`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'} <FaEdit className="ms-1" />
              </button>
            </div>
            <div className="user-card-body">
              <form onSubmit={handleSaveProfile} className="w-100">
                <div className="row g-3">
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4 text-end">
                    <button
                      type="submit"
                      className="user-btn user-btn-primary"
                    >
                      <FaSave className="me-1" /> Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="user-card">
            <div className="user-card-header">
              <h5 className="user-card-title mb-0">Change Password</h5>
            </div>
            <div className="user-card-body">
              <form onSubmit={handleUpdatePassword} className="w-100">
                <div className="mb-4">
                  <label className="form-label" htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="form-control"
                    placeholder="Enter your current password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="form-control"
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="col-lg-6">
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
                
                <div className="mt-4 text-end">
                  <button
                    type="submit"
                    className="user-btn user-btn-primary"
                  >
                    <FaKey className="me-1" /> Update Password
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
