import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      showEmail: true,
      showPhone: false,
      showAddress: false
    },
    preferences: {
      timezone: 'UTC+0',
      language: 'English',
      currency: 'USD'
    }
  });

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSelectChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="organizer-settings-container"
      style={{ paddingTop: '90px' }}
    >
      <div className="organizer-settings-header">
        <h1>Settings</h1>
      </div>

      <div className="organizer-settings-content">
        <section className="organizer-settings-section">
          <h2>Notifications</h2>
          <div className="organizer-settings-group">
            <div className="organizer-settings-item">
              <span>Email Notifications</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
            <div className="organizer-settings-item">
              <span>SMS Notifications</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={() => handleToggle('notifications', 'sms')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
            <div className="organizer-settings-item">
              <span>Push Notifications</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={() => handleToggle('notifications', 'push')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="organizer-settings-section">
          <h2>Privacy</h2>
          <div className="organizer-settings-group">
            <div className="organizer-settings-item">
              <span>Show Email Address</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={() => handleToggle('privacy', 'showEmail')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
            <div className="organizer-settings-item">
              <span>Show Phone Number</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showPhone}
                  onChange={() => handleToggle('privacy', 'showPhone')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
            <div className="organizer-settings-item">
              <span>Show Address</span>
              <label className="organizer-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showAddress}
                  onChange={() => handleToggle('privacy', 'showAddress')}
                />
                <span className="organizer-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="organizer-settings-section">
          <h2>Preferences</h2>
          <div className="organizer-settings-group">
            <div className="organizer-settings-item">
              <span>Timezone</span>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handleSelectChange('preferences', 'timezone', e.target.value)}
                className="organizer-select"
              >
                <option value="UTC+0">UTC+0</option>
                <option value="UTC+1">UTC+1</option>
                <option value="UTC+2">UTC+2</option>
                <option value="UTC+3">UTC+3</option>
                <option value="UTC+4">UTC+4</option>
                <option value="UTC+5">UTC+5</option>
              </select>
            </div>
            <div className="organizer-settings-item">
              <span>Language</span>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                className="organizer-select"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div className="organizer-settings-item">
              <span>Currency</span>
              <select
                value={settings.preferences.currency}
                onChange={(e) => handleSelectChange('preferences', 'currency', e.target.value)}
                className="organizer-select"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Settings; 