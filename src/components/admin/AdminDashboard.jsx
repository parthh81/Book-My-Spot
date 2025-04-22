import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaCalendarAlt, FaChartBar, FaMoneyBillWave, FaTicketAlt, 
  FaUserTie, FaMapMarkerAlt, FaSearch, FaFilter, FaPlus, FaEllipsisV,
  FaChevronRight, FaChartLine, FaExclamationTriangle, FaSignOutAlt, FaDownload, FaFileAlt
} from 'react-icons/fa';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminService from '../../services/AdminService';
import AuthService from '../../services/AuthService';
import ReportService from '../../services/ReportService';

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

// Fallback data in case API fails
const fallbackData = {
  stats: {
    totalUsers: 3,
    totalOrganizers: 2,
    totalEvents: 1,
    totalBookings: 5,
    totalRevenue: 125999,
    pendingApprovals: 0
  },
  userGrowth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0]
  },
  revenueData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [0, 25000, 0, 50000, 0, 20000, 30999, 0, 0, 0, 0, 0]
  },
  bookingsByCategory: {
    labels: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
    data: [2, 1, 1, 1, 0, 0]
  },
  recentUsers: [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'User', createdAt: '2023-04-15', status: 'Active' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'Organizer', createdAt: '2023-04-10', status: 'Active' }
  ],
  recentBookings: [
    { id: '1', customer: 'John Doe', eventName: 'Corporate Meeting', date: '2023-05-15', amount: 45000, status: 'Confirmed' },
    { id: '2', customer: 'Jane Smith', eventName: 'Wedding Reception', date: '2023-06-20', amount: 80999, status: 'Pending' }
  ],
  pendingApprovals: 0
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('month');

  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch system stats from the updated AdminService
        const systemStats = await AdminService.getSystemStats();
        console.log('Received system stats:', systemStats);
        
        // Process the data
        const dashboardData = {
          stats: {
            totalUsers: systemStats?.totalUsers || 0,
            totalOrganizers: systemStats?.totalOrganizers || 0,
            totalEvents: systemStats?.totalEvents || 0,
            totalBookings: systemStats?.totalBookings || 0,
            totalRevenue: systemStats?.totalRevenue || 0,
            pendingApprovals: systemStats?.pendingApprovals || 0
          },
          userGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: systemStats?.userGrowth || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          revenueData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: systemStats?.revenueData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          bookingsByCategory: {
            labels: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
            data: systemStats?.bookingsByCategory || [0, 0, 0, 0, 0, 0]
          },
          recentUsers: systemStats?.recentUsers || [],
          recentBookings: systemStats?.recentBookings || [],
          pendingApprovals: systemStats?.pendingApprovals || 0
        };
        
        setDashboardData(dashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set fallback data if API fails
        setDashboardData(fallbackData);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter]);

  // Chart configurations
  const userGrowthChartData = {
    labels: dashboardData?.userGrowth?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: dashboardData?.userGrowth?.data || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      }
    ]
  };

  const revenueChartData = {
    labels: dashboardData?.revenueData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData?.revenueData?.data || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
      }
    ]
  };

  const bookingsCategoryData = {
    labels: dashboardData?.bookingsByCategory?.labels || ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
    datasets: [
      {
        data: dashboardData?.bookingsByCategory?.data || [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 1,
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    },
    maintainAspectRatio: false
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    },
    maintainAspectRatio: false
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    },
    maintainAspectRatio: false
  };

  // Helper function for formatting currency
  const formatCurrency = (amount) => {
    return '₹' + new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function for formatting dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <FaExclamationTriangle className="me-2" />
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="admin-dashboard bg-light">
      {/* Admin Dashboard Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Admin Dashboard</h2>
            <p className="text-muted">Manage all aspects of BookMySpot platform</p>
          </div>
          <div className="d-flex gap-2">
            <select 
              className="form-select" 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="btn btn-primary" 
              style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
              onClick={() => ReportService.generateReport(dashboardData, timeFilter, 'pdf')}
            >
              <FaDownload className="me-2" /> Generate PDF Report
            </button>
            <Link
              to="/admin/reports"
              className="btn btn-outline-primary"
            >
              <FaFileAlt className="me-2" /> View Reports
            </Link>
            <button 
              className="btn btn-danger" 
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm mb-4 border-top">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/users"
                className="nav-link text-muted"
              >
                Users
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/organizers"
                className="nav-link text-muted"
              >
                Organizers
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/events"
                className="nav-link text-muted"
              >
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/bookings"
                className="nav-link text-muted"
              >
                Bookings
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/analytics"
                className="nav-link text-muted"
              >
                Revenue
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/reports"
                className="nav-link text-muted"
              >
                Reports
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-fluid pb-4">
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(54, 162, 235, 0.2)' }}
                    >
                      <FaUsers style={{ color: 'rgba(54, 162, 235, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Users</h6>
                      <h3 className="mb-0">{dashboardData?.stats?.totalUsers || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(153, 102, 255, 0.2)' }}
                    >
                      <FaUserTie style={{ color: 'rgba(153, 102, 255, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Organizers</h6>
                      <h3 className="mb-0">{dashboardData?.stats?.totalOrganizers || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(255, 206, 86, 0.2)' }}
                    >
                      <FaCalendarAlt style={{ color: 'rgba(255, 206, 86, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Events</h6>
                      <h3 className="mb-0">{dashboardData?.stats?.totalEvents || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(75, 192, 192, 0.2)' }}
                    >
                      <FaTicketAlt style={{ color: 'rgba(75, 192, 192, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Bookings</h6>
                      <h3 className="mb-0">{dashboardData?.stats?.totalBookings || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(255, 159, 64, 0.2)' }}
                    >
                      <FaMoneyBillWave style={{ color: 'rgba(255, 159, 64, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Revenue</h6>
                      <h3 className="mb-0">{formatCurrency(dashboardData?.stats?.totalRevenue || 0)}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm h-100 bg-warning bg-opacity-10">
                  <div className="card-body d-flex align-items-center">
                    <div 
                      className="rounded-circle p-3 me-3" 
                      style={{ backgroundColor: 'rgba(255, 99, 132, 0.2)' }}
                    >
                      <FaExclamationTriangle style={{ color: 'rgba(255, 99, 132, 1)', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Pending Approvals</h6>
                      <h3 className="mb-0">{dashboardData?.stats?.pendingApprovals || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 mb-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Revenue Overview</h5>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light" type="button" id="revenueDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <FaEllipsisV />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="revenueDropdown">
                        <li><button className="dropdown-item">Monthly</button></li>
                        <li><button className="dropdown-item">Quarterly</button></li>
                        <li><button className="dropdown-item">Yearly</button></li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: '300px' }}>
                    <Bar data={revenueChartData} options={barChartOptions} />
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Bookings by Category</h5>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light" type="button" id="bookingsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <FaEllipsisV />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="bookingsDropdown">
                        <li><button className="dropdown-item">Download</button></li>
                        <li><button className="dropdown-item">Print</button></li>
                        <li><button className="dropdown-item">Share</button></li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: '300px' }}>
                    <Pie data={bookingsCategoryData} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="row g-3">
              <div className="col-lg-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="card-title mb-0">Recent Users</h5>
                    <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                      View All <FaChevronRight className="ms-1" size={10} />
                    </Link>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 ? (
                            dashboardData.recentUsers.map(user => (
                              <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>
                                  <span className="badge bg-info">
                                    {user.role}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                    {user.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center py-3">No recent users found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="card-title mb-0">Recent Bookings</h5>
                    <Link to="/admin/bookings" className="btn btn-sm btn-outline-primary">
                      View All <FaChevronRight className="ms-1" size={10} />
                    </Link>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Event</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentBookings && dashboardData.recentBookings.length > 0 ? (
                            dashboardData.recentBookings.map(booking => (
                              <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.customer}</td>
                                <td>{booking.eventName}</td>
                                <td>{formatCurrency(booking.amount)}</td>
                                <td>
                                  <span className={`badge ${
                                    booking.status === 'Confirmed' ? 'bg-success' : 
                                    booking.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-3">No recent bookings found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">User Management</h5>
              <Link to="/admin/users/add" className="btn btn-primary" style={{backgroundColor: "#f05537", borderColor: "#f05537"}}>
                <FaPlus className="me-2" /> Add New User
              </Link>
            </div>
            <div className="card-body">
              <div className="admin-content-placeholder text-center py-5">
                <FaUsers className="display-1 text-muted mb-4 opacity-25" />
                <h3>User Management Module</h3>
                <p className="text-muted">This module will provide user search, filtering, and management capabilities</p>
                <Link to="/admin/users" className="btn btn-outline-primary mt-3">Explore User Management</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organizers' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Organizer Management</h5>
              <div className="d-flex gap-2">
                <Link to="/admin/organizers/approvals" className="btn btn-warning">
                  Pending Approvals ({dashboardData?.stats?.pendingApprovals || 0})
                </Link>
                <Link to="/admin/organizers/add" className="btn btn-primary" style={{backgroundColor: "#f05537", borderColor: "#f05537"}}>
                  <FaPlus className="me-2" /> Add Organizer
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="admin-content-placeholder text-center py-5">
                <FaUserTie className="display-1 text-muted mb-4 opacity-25" />
                <h3>Organizer Management Module</h3>
                <p className="text-muted">This module will provide organizer approval, monitoring, and management capabilities</p>
                <Link to="/admin/organizers" className="btn btn-outline-primary mt-3">Explore Organizer Management</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Event Management</h5>
              <Link to="/admin/events/add" className="btn btn-primary" style={{backgroundColor: "#f05537", borderColor: "#f05537"}}>
                <FaPlus className="me-2" /> Add Event
              </Link>
            </div>
            <div className="card-body">
              <div className="admin-content-placeholder text-center py-5">
                <FaCalendarAlt className="display-1 text-muted mb-4 opacity-25" />
                <h3>Event Management Module</h3>
                <p className="text-muted">This module will provide event listing, approval, and management capabilities</p>
                <Link to="/admin/events" className="btn btn-outline-primary mt-3">Explore Event Management</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Booking Management</h5>
              <Link to="/admin/bookings/add" className="btn btn-primary" style={{backgroundColor: "#f05537", borderColor: "#f05537"}}>
                <FaPlus className="me-2" /> Add Booking
              </Link>
            </div>
            <div className="card-body">
              <div className="admin-content-placeholder text-center py-5">
                <FaTicketAlt className="display-1 text-muted mb-4 opacity-25" />
                <h3>Booking Management Module</h3>
                <p className="text-muted">This module will provide booking oversight, status management, and issue resolution</p>
                <Link to="/admin/bookings" className="btn btn-outline-primary mt-3">Explore Booking Management</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Revenue & Analytics</h5>
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="reportsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <FaChartLine className="me-2" /> Generate Report
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="reportsDropdown">
                  <li><button className="dropdown-item">Revenue Report</button></li>
                  <li><button className="dropdown-item">Booking Analytics</button></li>
                  <li><button className="dropdown-item">User Growth Report</button></li>
                  <li><button className="dropdown-item">Custom Report</button></li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <div className="admin-content-placeholder text-center py-5">
                <FaChartBar className="display-1 text-muted mb-4 opacity-25" />
                <h3>Revenue & Analytics Module</h3>
                <p className="text-muted">This module will provide comprehensive reports, revenue tracking, and analytics dashboards</p>
                <Link to="/admin/revenue" className="btn btn-outline-primary mt-3">Explore Revenue & Analytics</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 