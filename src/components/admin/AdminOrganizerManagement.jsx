import React, { useState, useEffect } from 'react';
import { Table, Form, Badge, Button, Modal, Spinner, Card, Row, Col, Nav, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaSearch, FaCheck, FaTimes, FaEye, FaUserTie, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AdminService from '../../services/AdminService';
import { formatDate } from '../../utils/formatters';

const AdminOrganizerManagement = () => {
  // State for organizers data and UI controls
  const [organizers, setOrganizers] = useState([]);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [approvalReason, setApprovalReason] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchOrganizers();
    fetchPendingOrganizers();
  }, []);

  // Function to fetch all organizers
  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllOrganizers();
      setOrganizers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to load organizers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch pending organizer approvals
  const fetchPendingOrganizers = async () => {
    try {
      const data = await AdminService.getPendingOrganizerApprovals();
      setPendingOrganizers(data);
    } catch (err) {
      console.error('Error fetching pending organizers:', err);
      // We don't set the main error here to avoid disrupting the UI if only this request fails
    }
  };

  // Handle organizer approval/rejection
  const handleApprovalAction = (organizer, action) => {
    setSelectedOrganizer(organizer);
    setApprovalAction(action);
    setApprovalReason('');
    setShowApprovalModal(true);
  };

  // Handle view details
  const handleViewDetails = (organizer) => {
    setSelectedOrganizer(organizer);
    setShowDetailsModal(true);
  };

  // Process approval/rejection
  const processApproval = async () => {
    if (!selectedOrganizer || !approvalAction) return;
    
    try {
      setProcessingApproval(true);
      
      await AdminService.approveOrganizer(
        selectedOrganizer._id,
        approvalAction === 'approve',
        approvalReason
      );
      
      // Update local state
      if (approvalAction === 'approve') {
        // Move from pending to active
        setPendingOrganizers(pendingOrganizers.filter(o => o._id !== selectedOrganizer._id));
        setOrganizers([
          ...organizers,
          { ...selectedOrganizer, status: 'Active' }
        ]);
      } else {
        // Update to rejected
        setPendingOrganizers(pendingOrganizers.filter(o => o._id !== selectedOrganizer._id));
        setOrganizers([
          ...organizers,
          { ...selectedOrganizer, status: 'Rejected' }
        ]);
      }
      
      setShowApprovalModal(false);
      setSelectedOrganizer(null);
      setApprovalAction(null);
      setApprovalReason('');
    } catch (err) {
      console.error('Error processing organizer approval:', err);
      setError(`Failed to ${approvalAction} organizer. Please try again.`);
    } finally {
      setProcessingApproval(false);
    }
  };

  // Update organizer status
  const handleStatusChange = async (organizerId, isActive) => {
    try {
      setLoading(true);
      
      await AdminService.updateUserStatus(
        organizerId,
        isActive ? 'Active' : 'Inactive',
        ''
      );
      
      // Update local state
      setOrganizers(organizers.map(organizer => 
        organizer._id === organizerId
          ? { ...organizer, status: isActive ? 'Active' : 'Inactive' }
          : organizer
      ));
      
    } catch (err) {
      console.error('Error updating organizer status:', err);
      setError('Failed to update organizer status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter organizers based on search query and active tab
  const filteredOrganizers = activeTab === 'pending' 
    ? pendingOrganizers.filter(organizer => 
        searchQuery === '' || 
        (organizer.firstName + ' ' + organizer.lastName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : organizers.filter(organizer => {
        // Filter by status if on a specific tab
        if (activeTab === 'active' && organizer.status !== 'Active') {
          return false;
        }
        if (activeTab === 'rejected' && organizer.status !== 'Rejected') {
          return false;
        }
        
        // Apply search filter
        return searchQuery === '' || 
          (organizer.firstName + ' ' + organizer.lastName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          organizer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          organizer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      });

  // Get status badge based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge bg="success">Active</Badge>;
      case 'Pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div 
      className="admin-organizer-management p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Organizer Management</h4>
            <Button variant="primary">Add New Organizer</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Tabs */}
          <Tab.Container id="organizer-tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Row className="mb-4">
              <Col>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="all">All Organizers</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="active">Active</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="pending">
                      Pending Approval {pendingOrganizers.length > 0 && (
                        <Badge bg="warning" text="dark" pill>{pendingOrganizers.length}</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="rejected">Rejected</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
          </Tab.Container>
          
          {/* Search */}
          <Row className="mb-4">
            <Col md={8}>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <FaSearch className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search organizers by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  fetchOrganizers();
                  fetchPendingOrganizers();
                }}
                disabled={loading}
              >
                Refresh
              </Button>
            </Col>
          </Row>
          
          {/* Error Message if any */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {/* Organizers Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading organizers...</p>
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="text-center py-5">
              <FaUserTie className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
              <h5 className="text-muted">No organizers found</h5>
              <p className="text-muted">
                {activeTab === 'pending' 
                  ? 'There are no pending organizer approval requests at this time.' 
                  : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map(organizer => (
                  <tr key={organizer._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                          style={{ width: '36px', height: '36px' }}
                        >
                          <FaUserTie />
                        </div>
                        <div>
                          <div className="fw-medium">{organizer.firstName} {organizer.lastName}</div>
                          <small className="text-muted">{organizer.company || ''}</small>
                        </div>
                      </div>
                    </td>
                    <td>{organizer.email}</td>
                    <td>{organizer.phone || 'N/A'}</td>
                    <td>{formatDate(organizer.joinDate || organizer.createdAt)}</td>
                    <td>{getStatusBadge(organizer.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>View Details</Tooltip>}
                        >
                          <Button 
                            variant="light" 
                            size="sm" 
                            onClick={() => handleViewDetails(organizer)}
                          >
                            <FaEye />
                          </Button>
                        </OverlayTrigger>
                        
                        {organizer.status === 'Pending' && (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Approve</Tooltip>}
                            >
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleApprovalAction(organizer, 'approve')}
                              >
                                <FaCheck />
                              </Button>
                            </OverlayTrigger>
                            
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Reject</Tooltip>}
                            >
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleApprovalAction(organizer, 'reject')}
                              >
                                <FaTimes />
                              </Button>
                            </OverlayTrigger>
                          </>
                        )}
                        
                        {organizer.status === 'Active' && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Deactivate</Tooltip>}
                          >
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleStatusChange(organizer._id, false)}
                            >
                              <FaTimes />
                            </Button>
                          </OverlayTrigger>
                        )}
                        
                        {organizer.status === 'Rejected' && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Activate</Tooltip>}
                          >
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleStatusChange(organizer._id, true)}
                            >
                              <FaCheck />
                            </Button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Approval/Rejection Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {approvalAction === 'approve' ? 'Approve Organizer' : 'Reject Organizer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to <strong>{approvalAction === 'approve' ? 'approve' : 'reject'}</strong> the 
            organizer application for: <strong>{selectedOrganizer?.firstName} {selectedOrganizer?.lastName}</strong>?
          </p>
          
          <div className="mb-3">
            <strong>Email:</strong> {selectedOrganizer?.email}
          </div>
          
          {approvalAction === 'reject' && (
            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Provide a reason for rejecting this organizer application..."
              />
              <Form.Text className="text-muted">
                This reason will be shared with the applicant.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={approvalAction === 'approve' ? 'success' : 'danger'} 
            onClick={processApproval}
            disabled={processingApproval || (approvalAction === 'reject' && !approvalReason)}
          >
            {processingApproval ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              approvalAction === 'approve' ? 'Approve Organizer' : 'Reject Organizer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Organizer Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Organizer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrganizer && (
            <div className="organizer-details">
              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="mb-4">Personal Information</h5>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Name</div>
                    <div className="fw-medium">{selectedOrganizer.firstName} {selectedOrganizer.lastName}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Email</div>
                    <div className="fw-medium d-flex align-items-center">
                      <FaEnvelope className="me-2 text-muted" />
                      {selectedOrganizer.email}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Phone</div>
                    <div className="fw-medium d-flex align-items-center">
                      <FaPhone className="me-2 text-muted" />
                      {selectedOrganizer.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Account Status</div>
                    <div>{getStatusBadge(selectedOrganizer.status)}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="mb-4">Business Information</h5>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Company</div>
                    <div className="fw-medium">{selectedOrganizer.company || 'N/A'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Tax ID / GST</div>
                    <div className="fw-medium">{selectedOrganizer.taxId || 'N/A'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Website</div>
                    <div className="fw-medium">
                      {selectedOrganizer.website ? (
                        <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer">
                          {selectedOrganizer.website}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Registered On</div>
                    <div className="fw-medium d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-muted" />
                      {formatDate(selectedOrganizer.joinDate || selectedOrganizer.createdAt)}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <hr />
              
              <Row className="mb-4">
                <Col md={12}>
                  <h5 className="mb-4">Address</h5>
                  <div className="mb-3 d-flex align-items-start">
                    <FaMapMarkerAlt className="me-2 mt-1 text-muted" />
                    <div>
                      <div className="fw-medium">
                        {selectedOrganizer.address || 'No address provided'}
                      </div>
                      {selectedOrganizer.city && (
                        <div>
                          {selectedOrganizer.city}, {selectedOrganizer.state} {selectedOrganizer.zipCode}
                        </div>
                      )}
                      <div>{selectedOrganizer.country}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {selectedOrganizer.about && (
                <>
                  <hr />
                  <Row>
                    <Col md={12}>
                      <h5 className="mb-3">About</h5>
                      <p>{selectedOrganizer.about}</p>
                    </Col>
                  </Row>
                </>
              )}
              
              {selectedOrganizer.status === 'Rejected' && selectedOrganizer.rejectionReason && (
                <>
                  <hr />
                  <Row>
                    <Col md={12}>
                      <h5 className="mb-3 text-danger">Rejection Reason</h5>
                      <div className="alert alert-danger">
                        {selectedOrganizer.rejectionReason}
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedOrganizer && selectedOrganizer.status === 'Pending' && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleApprovalAction(selectedOrganizer, 'approve');
                }}
              >
                <FaCheck className="me-2" /> Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleApprovalAction(selectedOrganizer, 'reject');
                }}
              >
                <FaTimes className="me-2" /> Reject
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default AdminOrganizerManagement; 