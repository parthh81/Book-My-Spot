import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FaCalendarCheck, FaUsers, FaMoneyBillWave, FaCalendarAlt, FaArrowUp, FaArrowDown, FaEye, FaMapMarkerAlt, FaFileAlt, FaDownload, FaFilePdf, FaFileCsv, FaSpinner } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt as faCalendarAltSolid, faMapMarkerAlt, faChartLine, faTicketAlt, 
  faUsers as faUsersSolid, faMoneyBillWave as faMoneyBillWaveSolid, faCalendarPlus, faUserPlus,
  faChevronRight, faArrowUp as faArrowUpSolid, faArrowDown as faArrowDownSolid
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatCurrency } from '../../utils/formatters';
import EventsTable from './EventsTable';
import BookingService from '../../services/BookingService';
import '../../styles/dashboard.css';
import '../../styles/organizer-common.css'; // Import common organizer styles

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, 
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API base URL
const API_BASE_URL = "http://localhost:3200";

// Placeholder components for other tabs
const BookingsTable = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">Bookings</h3>
    <p>Bookings management coming soon...</p>
  </div>
);

const Analytics = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">Analytics</h3>
    <p>Analytics dashboard coming soon...</p>
  </div>
);

const OrganizerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('week');
  
  // Add state for report options
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [reportFormat, setReportFormat] = useState('csv');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const navigate = useNavigate();
  
  // Sample user data
  const user = {
    name: 'Alex Johnson',
    role: 'Event Organizer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  };
  
  // Inline style to fix padding issue
  const containerStyle = {
    paddingTop: '150px', // Increased padding further to prevent content from being hidden under navbar
  };
  
  // Chart data
  const bookingChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Bookings',
        data: [65, 70, 90, 81, 76, 85, 90, 100, 110, 105, 115, 120],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      }
    ]
  };

  const eventDistributionData = {
    labels: ['Corporate', 'Wedding', 'Birthday', 'Conference', 'Others'],
      datasets: [
        {
        data: [30, 25, 15, 20, 10],
          backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [50000, 65000, 75000, 90000, 110000, 95000, 105000, 115000, 125000, 135000, 145000, 160000],
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
    maintainAspectRatio: false,
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel for better performance
        const [bookingStats, recentBookingsResponse] = await Promise.all([
          BookingService.getBookingStats(),
          BookingService.getRecentBookings(5) // Fetch 5 recent bookings
        ]);

        console.log('Recent bookings response:', recentBookingsResponse);
        
        // Extract the data property from recentBookingsResponse if it exists
        const recentBookings = recentBookingsResponse?.data || [];

        // Organize the data for the dashboard
        const dashboardData = {
          stats: {
            totalEvents: bookingStats?.totalEvents || 0,
            totalBookings: bookingStats?.totalBookings || 0,
            totalRevenue: bookingStats?.totalRevenue || 0,
            totalCustomers: bookingStats?.totalCustomers || 0,
            pendingBookings: bookingStats?.pendingBookings || 0
          },
          recentBookings: recentBookings
        };

        setDashboardData(dashboardData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const navigateToCreateEvent = () => {
    navigate('/organizer/addevent');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Add handler for report generation
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const success = await BookingService.generateBookingReport(reportTimeframe, reportFormat);
      setGeneratingReport(false);
      
      if (success) {
        // Hide the report options after successful generation
        setShowReportOptions(false);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratingReport(false);
    }
  };

  // Render stats section
  const renderStats = () => {
    const { stats } = dashboardData;
    
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-title">Total Events</h3>
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCalendarAltSolid} />
            </div>
          </div>
          <p className="stat-value">{stats.totalEvents}</p>
          <div className="stat-change positive">
            <FontAwesomeIcon icon={faArrowUpSolid} className="stat-change-icon" />
            <span>12% from last month</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-card-header">
            <h3 className="stat-title">Total Bookings</h3>
            <div className="stat-icon success">
              <FontAwesomeIcon icon={faTicketAlt} />
            </div>
          </div>
          <p className="stat-value">{stats.totalBookings}</p>
          <div className="stat-change positive">
            <FontAwesomeIcon icon={faArrowUpSolid} className="stat-change-icon" />
            <span>8% from last month</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-card-header">
            <h3 className="stat-title">Total Revenue</h3>
            <div className="stat-icon warning">
              <FontAwesomeIcon icon={faMoneyBillWaveSolid} />
            </div>
          </div>
          <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          <div className="stat-change positive">
            <FontAwesomeIcon icon={faArrowUpSolid} className="stat-change-icon" />
            <span>15% from last month</span>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-card-header">
            <h3 className="stat-title">Total Users</h3>
            <div className="stat-icon danger">
              <FontAwesomeIcon icon={faUsersSolid} />
            </div>
          </div>
          <p className="stat-value">{stats.totalCustomers}</p>
          <div className="stat-change negative">
            <FontAwesomeIcon icon={faArrowDownSolid} className="stat-change-icon" />
            <span>3% from last month</span>
          </div>
        </div>
      </div>
    );
  };

  // Render recent bookings table
  const renderRecentBookings = () => {
    if (!dashboardData?.recentBookings || !Array.isArray(dashboardData.recentBookings) || dashboardData.recentBookings.length === 0) {
      return (
        <div className="empty-state-small">
          <p>No recent bookings found</p>
        </div>
      );
    }
    
    return (
      <table className="recent-bookings-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Event</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dashboardData.recentBookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div className="booking-customer">
                  <div className="customer-avatar">
                    {booking.userName ? booking.userName.substring(0, 2).toUpperCase() : 'NA'}
                  </div>
                  <span className="customer-name">{booking.userName || 'Unknown'}</span>
                </div>
              </td>
              <td>
                <span className="event-name">{booking.eventName || 'Unknown Event'}</span>
              </td>
              <td>{formatDate(booking.bookingDate)}</td>
              <td className="booking-amount">{formatCurrency(booking.amount || 0)}</td>
              <td>
                <span className={`booking-status ${booking.status?.toLowerCase() || 'pending'}`}>
                  {booking.status || 'Pending'}
                </span>
              </td>
              <td>
                <Link to={`/organizer/bookings/${booking.id}`} className="action-btn">
                  <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="organizer-loading">
        <div className="organizer-spinner"></div>
        <p>Loading dashboard data...</p>
        </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="organizer-empty-state">
        <div className="organizer-empty-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button className="organizer-btn organizer-btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="organizer-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Dashboard Overview</h1>
        <div className="d-flex align-items-center gap-2">
          {showReportOptions ? (
            <div className="report-options d-flex align-items-center">
              <div className="me-2">
                <select 
                  className="form-select form-select-sm" 
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="me-2">
                <select 
                  className="form-select form-select-sm" 
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <button 
                className="btn btn-success btn-sm me-2" 
                onClick={handleGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <FaSpinner className="fa-spin me-1" /> Generating...
                  </>
                ) : (
                  <>
                    {reportFormat === 'csv' ? <FaFileCsv className="me-1" /> : <FaFilePdf className="me-1" />}
                    Generate
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => setShowReportOptions(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline-primary me-2" 
              onClick={() => setShowReportOptions(true)}
            >
              <FaFileAlt className="me-1" /> Generate Report
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={navigateToCreateEvent}
            style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
          >
            <i className="fas fa-plus me-2"></i> Create Event
          </button>
        </div>
      </div>
      
      <div className="row stats-cards">
        <div className="col-md-4 mb-3">
          <div className="card stats-card primary-card">
            <div className="card-body">
              <h5 className="card-title">Total Events</h5>
              <p className="stats-value">{dashboardData?.stats?.totalEvents || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card stats-card success-card">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <p className="stats-value">{dashboardData?.stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card stats-card warning-card">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="stats-value">{formatCurrency(dashboardData?.stats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Recent Bookings</h3>
              <Link to="/organizer/bookings" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {renderRecentBookings()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganizerDashboard;