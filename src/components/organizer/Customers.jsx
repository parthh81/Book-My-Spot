import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomerService from '../../services/CustomerService';
import ConfigService from '../../services/ConfigService';
import '../../styles/customers.css';
import '../../styles/organizer-common.css';
import { FaUser, FaEnvelope, FaPhone, FaHistory, FaCalendarAlt, FaStar, FaMapMarkerAlt, FaIdCard, FaUserPlus, FaSearch, FaEye, FaPhoneAlt, FaMapMarkerAlt as FaLocation } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

// Get API_URL from ConfigService
const API_URL = ConfigService.getApiUrl();

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  
  const containerStyle = {
    paddingTop: '90px'
  };

  useEffect(() => {
    // Fetch customers using CustomerService
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Always use mock data as fallback
        const customersData = await CustomerService.getAllCustomers(true);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Unable to load customers. Please try again later.');
        setCustomers([]); // Set empty array to avoid undefined errors
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Helper functions
  const formatCount = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  // Group customers by first letter
  const groupedCustomers = {};
  filteredCustomers.forEach(customer => {
    const firstLetter = (customer.name?.[0] || '?').toUpperCase();
    if (!groupedCustomers[firstLetter]) {
      groupedCustomers[firstLetter] = [];
    }
    groupedCustomers[firstLetter].push(customer);
  });

  return (
    <motion.div 
      className="organizer-page-container" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="page-title">Customers</h1>
      <p className="text-muted mb-4">Showing all users who have registered in the system</p>
      
      <div className="row stats-cards">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card primary-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase">Total Customers</h6>
                  <p className="stats-value">{formatCount(customers.length)}</p>
                </div>
                <div className="stats-icon">
                  <FaUser size={24} className="text-primary opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card success-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase">Active Users</h6>
                  <p className="stats-value">{formatCount(customers.filter(c => c.isActive).length)}</p>
                </div>
                <div className="stats-icon">
                  <FaUserPlus size={24} className="text-success opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card warning-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase">Total Bookings</h6>
                  <p className="stats-value">{formatCount(customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0))}</p>
                </div>
                <div className="stats-icon">
                  <FaCalendarAlt size={24} className="text-warning opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card info-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase">Total Revenue</h6>
                  <p className="stats-value">{formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}</p>
                </div>
                <div className="stats-icon">
                  <FaMapMarkerAlt size={24} className="text-info opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-filter-container mb-4">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning" role="alert">
          {error}
          <button 
            className="btn btn-sm btn-primary ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <p>No customers found</p>
        </div>
      ) : (
        <div className="row">
          {Object.keys(groupedCustomers).sort().map(letter => (
            <div key={letter} className="mb-4">
              <h2 className="customer-group-letter">{letter}</h2>
              <div className="row">
                {groupedCustomers[letter].map(customer => (
                  <div key={customer.id} className="col-md-4 mb-4">
                    <div className="card customer-card h-100">
                      <div className="card-body">
                        <h3 className="card-title">{customer.name || 'Unnamed User'}</h3>
                        <div className="customer-contact mb-3">
                          <p><FaEnvelope className="me-2 text-muted" /> {customer.email || 'No email'}</p>
                          <p><FaPhone className="me-2 text-muted" /> {customer.phone || 'No phone'}</p>
                        </div>
                        
                        <div className="customer-stats mb-3">
                          <div className="row">
                            <div className="col-6">
                              <div className="stat-item">
                                <span className="stat-label">Bookings</span>
                                <span className="stat-value">{formatCount(customer.totalBookings)}</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="stat-item">
                                <span className="stat-label">Spent</span>
                                <span className="stat-value">{formatCurrency(customer.totalSpent)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleViewDetails(customer)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedCustomer && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="detail-group">
                      <h4><FaUser className="me-2" /> Personal Information</h4>
                      <div className="details-list">
                        <p><strong>Name:</strong> {selectedCustomer.name || 'Not provided'}</p>
                        <p><strong>Email:</strong> {selectedCustomer.email || 'Not provided'}</p>
                        <p><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="detail-group">
                      <h4><FaHistory className="me-2" /> Booking History</h4>
                      <div className="details-list">
                        <p><strong>Total Bookings:</strong> {formatCount(selectedCustomer.totalBookings)}</p>
                        <p><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
                        <p><strong>Last Booking:</strong> {selectedCustomer.lastBookingDate || 'No bookings yet'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="detail-group">
                      <h4><FaStar className="me-2" /> Preferences</h4>
                      <div className="details-list">
                        <p><strong>Favorite Event Type:</strong> {selectedCustomer.favoriteEventType || 'Not specified'}</p>
                        <p><strong>Preferred Location:</strong> {selectedCustomer.preferredLocation || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCustomer.userData && (
                    <div className="col-md-6">
                      <div className="detail-group">
                        <h4><FaIdCard className="me-2" /> Additional Information</h4>
                        <div className="details-list">
                          <p><strong>User ID:</strong> {selectedCustomer.userData._id || selectedCustomer.id}</p>
                          <p><strong>Joined:</strong> {new Date(selectedCustomer.userData.createdAt || Date.now()).toLocaleDateString()}</p>
                          <p><strong>Role:</strong> {selectedCustomer.userData.roleId?.name || 'User'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Customers; 