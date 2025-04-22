import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBell, FaKey, FaLock, FaEnvelope, FaMobile, FaToggleOn, FaToggleOff, FaSave } from 'react-icons/fa';

const UserSettings = () => {
  // State for form values
  const [settings, setSettings] = useState({
    // Privacy settings
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
    
    // Security settings
    twoFactorAuth: false,
    loginAlerts: true
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving settings:', settings);
    
    // Simulate API call
    setTimeout(() => {
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
  };
  
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Account Settings</h4>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/user">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Settings</li>
          </ol>
        </nav>
      </div>
      
      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          Settings saved successfully!
          <button type="button" className="btn-close" onClick={() => setSaveSuccess(false)} aria-label="Close"></button>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm">
            <div className="list-group list-group-flush">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
                style={{backgroundColor: activeTab === 'privacy' ? '#f05537' : '', color: activeTab === 'privacy' ? 'white' : ''}}
              >
                <FaShieldAlt className="me-2" /> Privacy
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
                style={{backgroundColor: activeTab === 'notifications' ? '#f05537' : '', color: activeTab === 'notifications' ? 'white' : ''}}
              >
                <FaBell className="me-2" /> Notifications
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                style={{backgroundColor: activeTab === 'security' ? '#f05537' : '', color: activeTab === 'security' ? 'white' : ''}}
              >
                <FaKey className="me-2" /> Security
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div>
                    <h5 className="card-title mb-4">Privacy Settings</h5>
                    
                    <div className="mb-4">
                      <label className="form-label">Profile Visibility</label>
                      <select 
                        className="form-select" 
                        name="profileVisibility" 
                        value={settings.profileVisibility}
                        onChange={handleChange}
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="private">Private - Only you can view your profile</option>
                        <option value="contacts">Contacts Only - Only people you've interacted with</option>
                      </select>
                      <div className="form-text">Control who can see your profile information</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="showEmail" 
                          name="showEmail" 
                          checked={settings.showEmail}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="showEmail">
                          <FaEnvelope className="me-2 text-muted" />
                          Show email on profile
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="showPhone" 
                          name="showPhone" 
                          checked={settings.showPhone}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="showPhone">
                          <FaMobile className="me-2 text-muted" />
                          Show phone number on profile
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div>
                    <h5 className="card-title mb-4">Notification Settings</h5>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="emailNotifications" 
                          name="emailNotifications" 
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-text ms-4">Receive booking confirmations and updates via email</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="pushNotifications" 
                          name="pushNotifications" 
                          checked={settings.pushNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="pushNotifications">
                          Push Notifications
                        </label>
                      </div>
                      <div className="form-text ms-4">Receive notifications in your browser</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="smsNotifications" 
                          name="smsNotifications" 
                          checked={settings.smsNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="smsNotifications">
                          SMS Notifications
                        </label>
                      </div>
                      <div className="form-text ms-4">Receive booking updates via SMS</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="bookingReminders" 
                          name="bookingReminders" 
                          checked={settings.bookingReminders}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="bookingReminders">
                          Booking Reminders
                        </label>
                      </div>
                      <div className="form-text ms-4">Receive reminders before your booked events</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="marketingEmails" 
                          name="marketingEmails" 
                          checked={settings.marketingEmails}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="marketingEmails">
                          Marketing Emails
                        </label>
                      </div>
                      <div className="form-text ms-4">Receive promotional offers and updates</div>
                    </div>
                  </div>
                )}
                
                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div>
                    <h5 className="card-title mb-4">Security Settings</h5>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Password</label>
                        <button 
                          type="button" 
                          className="btn btn-outline-primary btn-sm"
                          style={{borderColor: "#f05537", color: "#f05537"}}
                        >
                          Change Password
                        </button>
                      </div>
                      <div className="form-text">Last changed: 3 months ago</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="twoFactorAuth" 
                          name="twoFactorAuth" 
                          checked={settings.twoFactorAuth}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="twoFactorAuth">
                          Two-Factor Authentication
                        </label>
                      </div>
                      <div className="form-text ms-4">Add an extra layer of security to your account</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="loginAlerts" 
                          name="loginAlerts" 
                          checked={settings.loginAlerts}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="loginAlerts">
                          Login Alerts
                        </label>
                      </div>
                      <div className="form-text ms-4">Get notified when someone logs into your account</div>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="mb-3">Active Sessions</h6>
                      <div className="card bg-light mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Current Device</h6>
                              <p className="text-muted mb-0 small">Windows - Chrome - Mumbai, India</p>
                            </div>
                            <span className="badge bg-success">Active Now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-end mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
                  >
                    <FaSave className="me-2" /> Save Changes
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

export default UserSettings; 