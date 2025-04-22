import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { FaSave, FaCog, FaToggleOn, FaToggleOff, FaPercent, FaUsers, FaKey, FaEnvelope, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AdminService from '../../services/AdminService';
import { formatCurrency } from '../../utils/formatters';

const AdminSettings = () => {
  // State for settings data and UI controls
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    bookingFees: 0,
    platformFeePercentage: 5,
    eventApprovalRequired: true,
    maxUsersPerEvent: 100,
    supportEmail: 'support@bookmyspot.com',
    termsAndConditionsUrl: '',
    privacyPolicyUrl: '',
    paymentGateway: 'stripe',
    stripeApiKey: '',
    razorpayApiKey: '',
    emailNotifications: true,
    autoApproveUsers: false,
    autoApproveEvents: false,
    maxFileUploadSize: 10, // In MB
    allowedFileTypes: '.jpg,.jpeg,.png,.pdf',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h'
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Function to fetch system settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getSystemSettings();
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load system settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : 
                      type === 'number' ? parseFloat(value) : value;
    
    setSettings({
      ...settings,
      [name]: inputValue
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await AdminService.updateSystemSettings(settings);
      setSuccess('Settings updated successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to default values
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
      setSettings({
        maintenanceMode: false,
        bookingFees: 0,
        platformFeePercentage: 5,
        eventApprovalRequired: true,
        maxUsersPerEvent: 100,
        supportEmail: 'support@bookmyspot.com',
        termsAndConditionsUrl: '',
        privacyPolicyUrl: '',
        paymentGateway: 'stripe',
        stripeApiKey: '',
        razorpayApiKey: '',
        emailNotifications: true,
        autoApproveUsers: false,
        autoApproveEvents: false,
        maxFileUploadSize: 10,
        allowedFileTypes: '.jpg,.jpeg,.png,.pdf',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h'
      });
    }
  };

  return (
    <motion.div 
      className="admin-settings p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Settings</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={handleResetDefaults}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading settings...</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
                className="mb-3"
              >
                <Tab eventKey="general" title="General">
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h5 className="mb-3">Basic Settings</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="maintenanceMode"
                            name="maintenanceMode"
                            label="Maintenance Mode"
                            checked={settings.maintenanceMode}
                            onChange={handleInputChange}
                            className="d-flex align-items-center"
                          />
                          <Form.Text className="text-muted">
                            When enabled, the site will be inaccessible to all users except admins.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Support Email</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaEnvelope />
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              name="supportEmail"
                              value={settings.supportEmail}
                              onChange={handleInputChange}
                              placeholder="support@example.com"
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Currency</Form.Label>
                          <Form.Select
                            name="currency"
                            value={settings.currency}
                            onChange={handleInputChange}
                          >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <h5 className="mb-3">Date & Time</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Date Format</Form.Label>
                          <Form.Select
                            name="dateFormat"
                            value={settings.dateFormat}
                            onChange={handleInputChange}
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Time Format</Form.Label>
                          <Form.Select
                            name="timeFormat"
                            value={settings.timeFormat}
                            onChange={handleInputChange}
                          >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <h5 className="mb-3">Legal</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Terms and Conditions URL</Form.Label>
                          <Form.Control
                            type="url"
                            name="termsAndConditionsUrl"
                            value={settings.termsAndConditionsUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/terms"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Privacy Policy URL</Form.Label>
                          <Form.Control
                            type="url"
                            name="privacyPolicyUrl"
                            value={settings.privacyPolicyUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/privacy"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <h5 className="mb-3">File Upload Settings</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Max File Upload Size (MB)</Form.Label>
                          <Form.Control
                            type="number"
                            name="maxFileUploadSize"
                            value={settings.maxFileUploadSize}
                            onChange={handleInputChange}
                            min="1"
                            max="50"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Allowed File Types</Form.Label>
                          <Form.Control
                            type="text"
                            name="allowedFileTypes"
                            value={settings.allowedFileTypes}
                            onChange={handleInputChange}
                            placeholder=".jpg,.jpeg,.png,.pdf"
                          />
                          <Form.Text className="text-muted">
                            Comma-separated list of allowed file extensions
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="fees" title="Fees & Payments">
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h5 className="mb-3">Fee Structure</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Booking Fee (Fixed Amount)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              {settings.currency === 'INR' ? '₹' : 
                               settings.currency === 'USD' ? '$' :
                               settings.currency === 'EUR' ? '€' : '£'}
                            </InputGroup.Text>
                            <Form.Control
                              type="number"
                              name="bookingFees"
                              value={settings.bookingFees}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Fixed fee applied to each booking
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Platform Fee Percentage</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="number"
                              name="platformFeePercentage"
                              value={settings.platformFeePercentage}
                              onChange={handleInputChange}
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <InputGroup.Text>
                              <FaPercent />
                            </InputGroup.Text>
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Percentage of the booking amount that will be charged as platform fee
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <h5 className="mb-3">Payment Gateway</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Default Payment Gateway</Form.Label>
                          <Form.Select
                            name="paymentGateway"
                            value={settings.paymentGateway}
                            onChange={handleInputChange}
                          >
                            <option value="stripe">Stripe</option>
                            <option value="razorpay">Razorpay</option>
                            <option value="paypal">PayPal</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Stripe API Key</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaKey />
                            </InputGroup.Text>
                            <Form.Control
                              type="password"
                              name="stripeApiKey"
                              value={settings.stripeApiKey}
                              onChange={handleInputChange}
                              placeholder="sk_test_..."
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Razorpay API Key</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaKey />
                            </InputGroup.Text>
                            <Form.Control
                              type="password"
                              name="razorpayApiKey"
                              value={settings.razorpayApiKey}
                              onChange={handleInputChange}
                              placeholder="rzp_test_..."
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="approvals" title="Approvals & Limits">
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h5 className="mb-3">Approval Settings</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="eventApprovalRequired"
                            name="eventApprovalRequired"
                            label="Require Admin Approval for Events"
                            checked={settings.eventApprovalRequired}
                            onChange={handleInputChange}
                            className="d-flex align-items-center"
                          />
                          <Form.Text className="text-muted">
                            When enabled, new events must be approved by an admin before they are published.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="autoApproveUsers"
                            name="autoApproveUsers"
                            label="Auto-Approve New Users"
                            checked={settings.autoApproveUsers}
                            onChange={handleInputChange}
                            className="d-flex align-items-center"
                          />
                          <Form.Text className="text-muted">
                            When enabled, new user registrations are automatically approved.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="autoApproveEvents"
                            name="autoApproveEvents"
                            label="Auto-Approve Events"
                            checked={settings.autoApproveEvents}
                            onChange={handleInputChange}
                            className="d-flex align-items-center"
                          />
                          <Form.Text className="text-muted">
                            When enabled, new events are automatically approved.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <h5 className="mb-3">Limits</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Maximum Users Per Event</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaUsers />
                            </InputGroup.Text>
                            <Form.Control
                              type="number"
                              name="maxUsersPerEvent"
                              value={settings.maxUsersPerEvent}
                              onChange={handleInputChange}
                              min="1"
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Maximum number of users allowed to book a single event
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="notifications" title="Notifications">
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h5 className="mb-3">Email Notifications</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="emailNotifications"
                            name="emailNotifications"
                            label="Enable Email Notifications"
                            checked={settings.emailNotifications}
                            onChange={handleInputChange}
                            className="d-flex align-items-center"
                          />
                          <Form.Text className="text-muted">
                            When enabled, system will send email notifications for various events.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
          
          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="outline-secondary" 
              className="me-2"
              onClick={handleResetDefaults}
            >
              Reset to Defaults
            </Button>
            <Button 
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Save Settings
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </motion.div>
  );
};

export default AdminSettings; 