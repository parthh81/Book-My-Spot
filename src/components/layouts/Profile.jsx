import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaEdit, 
  FaKey, 
  FaSignOutAlt, 
  FaCamera, 
  FaChartLine, 
  FaTicketAlt,
  FaCalendarPlus,
  FaCog,
  FaBell,
  FaUserFriends,
  FaMoneyBillWave,
  FaCrown
} from 'react-icons/fa';
import '../styles/profile.css';
import AuthService from '../../services/AuthService';

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: 'Parth',
    lastName: 'Thakkar',
    email: 'parth.thakkar@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    joinedDate: 'January 2023',
    role: 'Organizer',
    profileImage: null,
    organizerStats: {
      totalEvents: 12,
      activeEvents: 5,
      totalBookings: 345,
      totalRevenue: 458000,
      avgRating: 4.8
    }
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...userData});
  
  // For demonstration purposes - in a real app, you would fetch from an API
  useEffect(() => {
    // Get user data from AuthService
    const userInfo = AuthService.getUserInfo();
    
    setUserData(prev => ({
      ...prev,
      firstName: userInfo.firstName || 'Parth',
      lastName: userInfo.lastName || 'Thakkar',
      email: userInfo.email || 'parth.thakkar@example.com',
      role: userInfo.role || 'Organizer'
    }));
    
    setEditedData(prev => ({
      ...prev,
      firstName: userInfo.firstName || 'Parth',
      lastName: userInfo.lastName || 'Thakkar',
      email: userInfo.email || 'parth.thakkar@example.com',
      role: userInfo.role || 'Organizer'
    }));
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveChanges = () => {
    setUserData({...editedData});
    setIsEditing(false);
    
    // Get current user info from AuthService
    const userInfo = AuthService.getUserInfo();
    
    // Update AuthService with new values
    AuthService.setAuthData({
      ...userInfo,
      firstName: editedData.firstName,
      lastName: editedData.lastName,
      email: editedData.email
    });
    
    // Show success message
    alert('Profile updated successfully!');
  };
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Organizer Profile</h1>
        <p className="profile-subtitle">Manage your account information and event settings</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-image-container">
            <div className="profile-image">
              {editedData.profileImage ? (
                <img src={editedData.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
              ) : (
                <div className="profile-initials">
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </div>
              )}
              
              {isEditing && (
                <label className="profile-image-upload">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageChange} 
                    style={{ display: 'none' }} 
                  />
                  <div className="image-upload-icon">
                    <FaCamera />
                  </div>
                </label>
              )}
            </div>
            <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>
            <div className="profile-role-badge">
              <FaCrown className="role-icon" />
              <span>{userData.role}</span>
            </div>
          </div>
          
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <FaUser className="tab-icon" />
              <span>Personal Information</span>
            </button>
            <button 
              className={`profile-tab ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              <FaChartLine className="tab-icon" />
              <span>Business Profile</span>
            </button>
            <button 
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FaKey className="tab-icon" />
              <span>Security</span>
            </button>
            <button 
              className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <FaCog className="tab-icon" />
              <span>Preferences</span>
            </button>
          </div>
        </div>
        
        <div className="profile-main">
          {activeTab === 'personal' && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                <button 
                  className="edit-button"
                  onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit'}
                </button>
              </div>
              
              <div className="organizer-stats-row">
                <div className="organizer-stat-card">
                  <FaCalendarPlus className="stat-icon event-icon" />
                  <div className="stat-content">
                    <h4>{userData.organizerStats.totalEvents}</h4>
                    <p>Total Events</p>
                  </div>
                </div>
                
                <div className="organizer-stat-card">
                  <FaTicketAlt className="stat-icon booking-icon" />
                  <div className="stat-content">
                    <h4>{userData.organizerStats.totalBookings}</h4>
                    <p>Total Bookings</p>
                  </div>
                </div>
                
                <div className="organizer-stat-card">
                  <FaMoneyBillWave className="stat-icon revenue-icon" />
                  <div className="stat-content">
                    <h4>₹{userData.organizerStats.totalRevenue.toLocaleString()}</h4>
                    <p>Total Revenue</p>
                  </div>
                </div>
                
                <div className="organizer-stat-card">
                  <FaUserFriends className="stat-icon users-icon" />
                  <div className="stat-content">
                    <h4>{userData.organizerStats.avgRating}</h4>
                    <p>Average Rating</p>
                  </div>
                </div>
              </div>
              
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="firstName" 
                        value={editedData.firstName} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="info-item">
                        <FaUser className="info-icon" />
                        <span>{userData.firstName}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="lastName" 
                        value={editedData.lastName} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="info-item">
                        <FaUser className="info-icon" />
                        <span>{userData.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        name="email" 
                        value={editedData.email} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="info-item">
                        <FaEnvelope className="info-icon" />
                        <span>{userData.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        name="phone" 
                        value={editedData.phone} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="info-item">
                        <FaPhone className="info-icon" />
                        <span>{userData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="location" 
                        value={editedData.location} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{userData.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Joined</label>
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <span>{userData.joinedDate}</span>
                    </div>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="form-actions">
                    <button 
                      className="cancel-button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({...userData});
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-button"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'business' && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Business Profile</h3>
                <button className="edit-button">Edit</button>
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Business Name</label>
                  <div className="info-item">
                    <FaUser className="info-icon" />
                    <span>Thakkar Events Management</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Business Description</label>
                  <div className="info-item info-item-multiline">
                    <span>We provide premium event management services for corporate events, weddings, and special occasions. With over 5 years of experience, we specialize in creating memorable events that exceed expectations.</span>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Business Email</label>
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <span>contact@thakkarevents.com</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Business Phone</label>
                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <span>+91 22 6543 2100</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Business Address</label>
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>123 Business Park, Andheri East, Mumbai 400069</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tax Information</label>
                  <div className="info-item">
                    <FaMoneyBillWave className="info-icon" />
                    <span>GST: 27AAACT2727Q1ZQ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Security Settings</h3>
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Change Password</label>
                  <div className="password-form">
                    <div className="password-field">
                      <label>Current Password</label>
                      <input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="password-field">
                      <label>New Password</label>
                      <input type="password" placeholder="Enter new password" />
                    </div>
                    <div className="password-field">
                      <label>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" />
                    </div>
                    <button className="change-password-btn">Update Password</button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Two-Factor Authentication</label>
                  <div className="two-factor">
                    <div className="two-factor-toggle">
                      <input type="checkbox" id="two-factor-toggle" />
                      <label htmlFor="two-factor-toggle">Enable Two-Factor Authentication</label>
                    </div>
                    <p className="two-factor-description">
                      Add an extra layer of security to your account by requiring a verification code in addition to your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Preferences</h3>
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Email Notifications</label>
                  <div className="notification-options">
                    <div className="notification-option">
                      <input type="checkbox" id="event-notifications" defaultChecked />
                      <label htmlFor="event-notifications">Event Updates</label>
                    </div>
                    <div className="notification-option">
                      <input type="checkbox" id="booking-notifications" defaultChecked />
                      <label htmlFor="booking-notifications">Booking Confirmations</label>
                    </div>
                    <div className="notification-option">
                      <input type="checkbox" id="marketing-notifications" />
                      <label htmlFor="marketing-notifications">Marketing & Promotions</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Language</label>
                  <select className="language-select">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date Format</label>
                  <select className="date-format-select">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 