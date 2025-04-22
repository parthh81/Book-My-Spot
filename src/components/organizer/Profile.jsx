import React, { useState, useEffect } from 'react';
import { FaKey, FaPen } from 'react-icons/fa';
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';
import axios from 'axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Password change fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      setIsLoading(true);
      try {
        // Load data from AuthService
        const userInfo = AuthService.getUserInfo();
        const user = AuthService.getUser();
        
        // Ensure we get phone from the right place and with a fallback
        const phoneNumber = user?.phone || ''; // Try to get phone directly
        
        setFormData({
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          email: userInfo.email || '',
          phone: phoneNumber
        });
        
        // Log data for debugging
        console.log("User data loaded:", { userInfo, user, phone: phoneNumber });
        
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get current user data
      const user = AuthService.getUser();
      
      // Update AuthService data
      AuthService.setAuthData({
        ...AuthService.getUserInfo(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      // Update user object if it exists
      if (user) {
        const updatedUser = {
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone // Make sure phone is saved
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Add phone to fetch from server side - real implementation would call API
      console.log('Profile updated with phone:', formData.phone);
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      // Use the AuthService method for changing password
      await AuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      toast.success('Password updated successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update failed:', error);
      
      // Extract error message from the response
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Profile Information Card */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Profile Information</h5>
            {!isEditing ? (
              <button 
                className="btn btn-outline-primary d-flex align-items-center" 
                onClick={() => setIsEditing(true)}
              >
                <FaPen className="me-2" /> Edit Profile
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleProfileSubmit}>
            <div className="row g-4">
              {/* First Name */}
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              {/* Last Name */}
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              {/* Email */}
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              {/* Phone */}
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-4 text-end">
                <button 
                  type="submit" 
                  className="btn btn-primary px-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Change Password Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h5 className="mb-0">Change Password</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handlePasswordSubmit}>
            <div className="row g-4">
              {/* Current Password */}
              <div className="col-12">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* New Password */}
              <div className="col-md-6">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                {passwordData.newPassword && (
                  <div className="password-strength mt-2">
                    <div className="progress" style={{ height: '5px' }}>
                      <div 
                        className={`progress-bar ${
                          passwordData.newPassword.length < 6 ? 'bg-danger' : 
                          passwordData.newPassword.length < 8 ? 'bg-warning' : 
                          'bg-success'
                        }`} 
                        style={{ 
                          width: `${Math.min(100, passwordData.newPassword.length * 10)}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">Password must be at least 6 characters</small>
                  </div>
                )}
              </div>
              
              {/* Confirm Password */}
              <div className="col-md-6">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                />
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <div className="mt-2">
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <small className="text-success">Passwords match</small>
                    ) : (
                      <small className="text-danger">Passwords do not match</small>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-end">
              <button 
                type="submit" 
                className="btn btn-danger d-flex align-items-center ms-auto"
                disabled={isLoading}
              >
                <FaKey className="me-2" /> 
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 