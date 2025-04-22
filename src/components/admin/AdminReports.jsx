import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { 
  FaChartBar, FaDownload, FaUsers, FaCalendarAlt, 
  FaMoneyBillWave, FaTicketAlt, FaFileAlt, FaFilePdf, 
  FaFileCsv, FaFileExcel 
} from 'react-icons/fa';
import AdminService from '../../services/AdminService';
import ReportService from '../../services/ReportService';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeFrame, setTimeFrame] = useState('month');
  const [reportType, setReportType] = useState('full');
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch data needed for reports
  useEffect(() => {
    fetchDashboardData();
  }, [timeFrame]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch system stats
      const systemStats = await AdminService.getSystemStats();
      
      // Fetch revenue analytics based on selected timeframe
      const revenue = await AdminService.getRevenueAnalytics(timeFrame);
      
      // Fetch bookings by category
      const bookingsByCategory = await AdminService.getBookingsByCategory();
      
      // Structure the data similar to what's in AdminDashboard
      const formattedData = {
        stats: {
          totalUsers: systemStats?.totalUsers || 0,
          totalOrganizers: systemStats?.totalOrganizers || 0,
          totalEvents: systemStats?.totalEvents || 0,
          totalBookings: systemStats?.totalBookings || 0,
          totalRevenue: systemStats?.totalRevenue || 0,
          pendingApprovals: systemStats?.pendingApprovals || 0
        },
        revenueData: revenue || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        bookingsByCategory: bookingsByCategory || {
          labels: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
          data: [0, 0, 0, 0, 0, 0]
        },
        recentUsers: systemStats?.recentUsers || [],
        recentBookings: systemStats?.recentBookings || []
      };
      
      setDashboardData(formattedData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load data needed for reports. Please try again.');
      setLoading(false);
    }
  };

  const handleGenerateReport = async (format) => {
    setGenerating(true);
    setSuccessMessage('');
    
    try {
      // Generate report with the selected format and timeframe
      const success = await ReportService.generateReport(dashboardData, timeFrame, format);
      
      if (success) {
        setSuccessMessage(`${format.toUpperCase()} report generated successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(`Failed to generate ${format.toUpperCase()} report. Please try again.`);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(`Error generating report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="admin-reports p-4">
      <h2 className="mb-4">Report Generation</h2>
      
      {/* Alert messages */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading report data...</p>
        </div>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Report Settings</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Period</Form.Label>
                    <Form.Select 
                      value={timeFrame} 
                      onChange={(e) => setTimeFrame(e.target.value)}
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Select the time period for which you want to generate the report.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Report Type</Form.Label>
                    <Form.Select 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="full">Full Report</option>
                      <option value="financial">Financial Report</option>
                      <option value="bookings">Bookings Report</option>
                      <option value="users">Users Report</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Choose the type of report you want to generate.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Export Options</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                      <FaFilePdf className="mb-3" style={{ fontSize: '3rem', color: '#f05537' }} />
                      <h5>PDF Report</h5>
                      <p className="text-muted text-center mb-3">
                        Generate a professionally formatted PDF report with charts and tables.
                      </p>
                      <Button 
                        variant="primary" 
                        className="mt-auto w-100"
                        onClick={() => handleGenerateReport('pdf')}
                        disabled={generating}
                        style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}
                      >
                        {generating ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FaDownload className="me-2" /> Export as PDF
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                      <FaFileCsv className="mb-3" style={{ fontSize: '3rem', color: '#28a745' }} />
                      <h5>CSV Report</h5>
                      <p className="text-muted text-center mb-3">
                        Export data in CSV format for easy importing into spreadsheet applications.
                      </p>
                      <Button 
                        variant="success" 
                        className="mt-auto w-100"
                        onClick={() => handleGenerateReport('csv')}
                        disabled={generating}
                      >
                        {generating ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FaDownload className="me-2" /> Export as CSV
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                      <FaFileExcel className="mb-3" style={{ fontSize: '3rem', color: '#17a2b8' }} />
                      <h5>Excel Report</h5>
                      <p className="text-muted text-center mb-3">
                        Coming Soon: Export data in Excel format with pre-formatted tables and charts.
                      </p>
                      <Button 
                        variant="info" 
                        className="mt-auto w-100"
                        disabled={true}
                      >
                        <FaDownload className="me-2" /> Coming Soon
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Report Preview</h5>
            </Card.Header>
            <Card.Body>
              <div className="report-preview p-4 border rounded bg-light">
                <div className="text-center mb-4">
                  <FaFileAlt style={{ fontSize: '3rem', color: '#6c757d' }} />
                  <h4 className="mt-3">BookMySpot Administrative Report</h4>
                  <p>Time Period: {timeFrame === 'week' ? 'Weekly' : timeFrame === 'month' ? 'Monthly' : timeFrame === 'quarter' ? 'Quarterly' : 'Yearly'}</p>
                </div>
                
                <Row className="g-4 mb-4">
                  <Col md={3}>
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaUsers className="mb-2" style={{ fontSize: '2rem', color: 'rgba(54, 162, 235, 0.8)' }} />
                        <h6>Total Users</h6>
                        <h3>{dashboardData.stats.totalUsers}</h3>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaCalendarAlt className="mb-2" style={{ fontSize: '2rem', color: 'rgba(255, 206, 86, 0.8)' }} />
                        <h6>Total Events</h6>
                        <h3>{dashboardData.stats.totalEvents}</h3>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaTicketAlt className="mb-2" style={{ fontSize: '2rem', color: 'rgba(75, 192, 192, 0.8)' }} />
                        <h6>Total Bookings</h6>
                        <h3>{dashboardData.stats.totalBookings}</h3>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaMoneyBillWave className="mb-2" style={{ fontSize: '2rem', color: 'rgba(255, 99, 132, 0.8)' }} />
                        <h6>Total Revenue</h6>
                        <h3>₹{dashboardData.stats.totalRevenue}</h3>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-center text-muted">
                  <p>Click one of the export options above to generate the complete report.</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminReports; 