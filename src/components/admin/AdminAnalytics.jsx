import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Spinner, Alert, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaDownload, 
  FaUsers, FaCalendarAlt, FaMoneyBillWave, FaTicketAlt 
} from 'react-icons/fa';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import AdminService from '../../services/AdminService';
import ReportService from '../../services/ReportService';
import { formatCurrency, formatCount } from '../../utils/formatters';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  // State for analytics data and UI controls
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics data state
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  });
  
  const [bookingsByCategoryData, setBookingsByCategoryData] = useState({
    labels: [],
    datasets: []
  });
  
  const [bookingStatusData, setBookingStatusData] = useState({
    labels: [],
    datasets: []
  });
  
  const [eventPerformanceData, setEventPerformanceData] = useState({
    labels: [],
    datasets: []
  });
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  // Fetch analytics data on component mount and when timeframe changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFrame]);

  // Function to fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch system statistics
      const stats = await AdminService.getSystemStats();
      setSystemStats(stats);
      
      // Fetch revenue analytics
      const revenue = await AdminService.getRevenueAnalytics(timeFrame);
      setRevenueData({
        labels: revenue.labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenue.data,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      });
      
      // Fetch bookings by category
      const bookingsByCategory = await AdminService.getBookingsByCategory();
      setBookingsByCategoryData({
        labels: bookingsByCategory.labels,
        datasets: [
          {
            data: bookingsByCategory.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      // Mock data for booking status distribution
      setBookingStatusData({
        labels: ['Confirmed', 'Pending', 'Cancelled', 'Refunded'],
        datasets: [
          {
            data: [65, 20, 10, 5],
            backgroundColor: [
              'rgba(40, 167, 69, 0.7)',
              'rgba(255, 193, 7, 0.7)',
              'rgba(220, 53, 69, 0.7)',
              'rgba(23, 162, 184, 0.7)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      // Mock data for event performance
      setEventPerformanceData({
        labels: ['Wedding Gala', 'Tech Conference', 'Birthday Party', 'Corporate Meeting', 'Concert'],
        datasets: [
          {
            label: 'Bookings',
            data: [45, 60, 30, 25, 80],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Revenue',
            data: [50000, 75000, 25000, 30000, 100000],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
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
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const handleExportData = (format) => {
    // Create a data object similar to dashboardData in AdminDashboard
    const reportData = {
      stats: systemStats,
      revenueData: {
        labels: revenueData.labels,
        data: revenueData.datasets[0].data
      },
      bookingsByCategory: {
        labels: bookingsByCategoryData.labels,
        data: bookingsByCategoryData.datasets[0].data
      },
      // No recent users or bookings available in this component
      recentUsers: [],
      recentBookings: []
    };
    
    // Generate report with appropriate format
    ReportService.generateReport(reportData, timeFrame, format);
  };

  return (
    <motion.div 
      className="admin-analytics p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Analytics & Reports</h2>
        <div className="d-flex gap-3">
          <Form.Select 
            value={timeFrame}
            onChange={handleTimeFrameChange}
            style={{ width: "150px" }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Form.Select>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="export-dropdown">
              <FaDownload className="me-2" /> Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleExportData('pdf')}>Export as PDF</Dropdown.Item>
              <Dropdown.Item onClick={() => handleExportData('csv')}>Export as CSV</Dropdown.Item>
              <Dropdown.Item onClick={() => handleExportData('excel')}>Export as Excel</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Button 
            variant="primary"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="gy-4 mb-4">
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: 'rgba(54, 162, 235, 0.2)' }}
                  >
                    <FaUsers style={{ fontSize: '1.5rem', color: 'rgba(54, 162, 235, 1)' }} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Users</h6>
                    <h3>{formatCount(systemStats.totalUsers)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: 'rgba(255, 206, 86, 0.2)' }}
                  >
                    <FaCalendarAlt style={{ fontSize: '1.5rem', color: 'rgba(255, 206, 86, 1)' }} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Events</h6>
                    <h3>{formatCount(systemStats.totalEvents)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: 'rgba(75, 192, 192, 0.2)' }}
                  >
                    <FaTicketAlt style={{ fontSize: '1.5rem', color: 'rgba(75, 192, 192, 1)' }} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Bookings</h6>
                    <h3>{formatCount(systemStats.totalBookings)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: 'rgba(255, 99, 132, 0.2)' }}
                  >
                    <FaMoneyBillWave style={{ fontSize: '1.5rem', color: 'rgba(255, 99, 132, 1)' }} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h3>{formatCurrency(systemStats.totalRevenue)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Analytics Tabs */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
                className="mb-3"
              >
                <Tab eventKey="overview" title="Overview">
                  <Card.Body>
                    <Row className="gy-4">
                      <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartLine className="me-2" /> Revenue Trend</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '300px' }}>
                              <Bar data={revenueData} options={barChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartPie className="me-2" /> Bookings by Category</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '300px' }}>
                              <Pie data={bookingsByCategoryData} options={pieChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={12}>
                        <Card className="border-0 shadow-sm">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartPie className="me-2" /> Booking Status</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '300px' }}>
                              <Doughnut data={bookingStatusData} options={pieChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="revenue" title="Revenue">
                  <Card.Body>
                    <Row className="gy-4">
                      <Col lg={12}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartBar className="me-2" /> Revenue Analysis</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '400px' }}>
                              <Bar data={revenueData} options={barChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="users" title="Users">
                  <Card.Body>
                    <Row className="gy-4">
                      <Col lg={12}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaUsers className="me-2" /> User Statistics</h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="text-center py-5">
                              <h3 className="text-muted">User data is not available</h3>
                              <p className="text-muted">User growth analytics has been removed from this view.</p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="events" title="Events">
                  <Card.Body>
                    <Row className="gy-4">
                      <Col lg={12}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartBar className="me-2" /> Top Performing Events</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '400px' }}>
                              <Bar 
                                data={eventPerformanceData} 
                                options={{
                                  ...barChartOptions,
                                  scales: {
                                    y: { 
                                      beginAtZero: true,
                                      title: {
                                        display: true,
                                        text: 'Bookings / Revenue (₹)'
                                      }
                                    }
                                  }
                                }} 
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                
                <Tab eventKey="bookings" title="Bookings">
                  <Card.Body>
                    <Row className="gy-4">
                      <Col lg={6}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartPie className="me-2" /> Bookings by Category</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '300px' }}>
                              <Pie data={bookingsByCategoryData} options={pieChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={6}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><FaChartPie className="me-2" /> Booking Status Distribution</h5>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ height: '300px' }}>
                              <Doughnut data={bookingStatusData} options={pieChartOptions} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
          
          <div className="text-center text-muted small mt-5">
            <p>The data shown above is based on {timeFrame === 'week' ? 'weekly' : timeFrame === 'month' ? 'monthly' : timeFrame === 'quarter' ? 'quarterly' : 'yearly'} analytics.</p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdminAnalytics; 