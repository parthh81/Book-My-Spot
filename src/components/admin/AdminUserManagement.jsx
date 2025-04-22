import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Spinner, Alert, Modal, Badge, Dropdown } from 'react-bootstrap';
import { FaSearch, FaCheck, FaBan, FaEye, FaUserAlt, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AdminService from '../../services/AdminService';
import { Link } from 'react-router-dom';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear error and success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getAllUsers();
      // Extract users array from the response, which might be nested in a data property
      const usersArray = Array.isArray(response) ? response : 
                        (response?.data && Array.isArray(response.data)) ? response.data : [];
      setUsers(usersArray);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (user, isActive) => {
    setSelectedUser({ 
      ...user, 
      _id: user._id || user.id, // Ensure we have the ID in the expected field
      newStatus: isActive ? 'Active' : 'Inactive' 
    });
    setShowModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const response = await AdminService.updateUserStatus(
        selectedUser._id, 
        selectedUser.newStatus === 'Active', 
        statusReason
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          const userId = user._id || user.id;
          const selectedId = selectedUser._id || selectedUser.id;
          
          if (userId === selectedId) {
            return { ...user, status: selectedUser.newStatus };
          }
          return user;
        })
      );
      
      // Show success alert
      setError(null);
      setSuccess(`User status successfully changed to ${selectedUser.newStatus}`);
      
      // Close modal and reset form
      setShowModal(false);
      setStatusReason('');
      setSelectedUser(null);
      
      // Refresh the users list after a short delay
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    } catch (err) {
      setError(`Failed to update user status: ${err.message || 'Please try again.'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search input and role filter
  const filteredUsers = users && Array.isArray(users) ? users.filter(user => {
    // If users array is not properly structured, return false
    if (!user || typeof user !== 'object') return false;
    
    // Exclude admin users from the list
    if (user.roleId && user.roleId.name && user.roleId.name.toLowerCase() === 'admin') {
      return false;
    }
    
    // Apply role filter
    if (roleFilter !== 'all' && 
        (!user.roleId || 
         !user.roleId.name || 
         user.roleId.name.toLowerCase() !== roleFilter)) {
      return false;
    }
    
    // Apply search filter - safely check each property
    if (!searchInput) return true; // If no search input, include all users
    
    const searchLower = searchInput.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();
    
    return fullName.includes(searchLower) ||
           email.includes(searchLower) ||
           phone.includes(searchLower);
  }) : [];

  const getRoleBadge = (role) => {
    // Debug the role format first
    console.log('Role format received:', role, typeof role);
    
    // Case 1: If role is falsy (null, undefined, empty string, etc.)
    if (!role) {
      return <Badge bg="secondary">Unknown</Badge>;
    }
    
    // Case 2: If role is an object with a name property (properly populated from backend)
    if (typeof role === 'object' && role.name) {
      switch (role.name.toLowerCase()) {
        case 'organizer':
          return <Badge bg="primary">Organizer</Badge>;
        case 'user':
          return <Badge bg="success">User</Badge>;
        case 'admin':
          return <Badge bg="danger">Admin</Badge>;
        default:
          return <Badge bg="secondary">{role.name}</Badge>;
      }
    }
    
    // Case 3: If role is just an ID (not populated), map to known role IDs
    if (typeof role === 'string' || (role && role.toString)) {
      const roleId = role.toString();
      
      // Map based on known role IDs from signup.jsx
      if (roleId === '67bfea7a9e9b1ff35394c90d') {
        return <Badge bg="success">User</Badge>;
      } else if (roleId === '67eec81cdc0688d1102e953e') {
        return <Badge bg="primary">Organizer</Badge>;
      }
    }
    
    // Case 4: Infer from email pattern for partially populated data
    // Looking for organizer email pattern (for backward compatibility)
    if (typeof selectedUser === 'object' && selectedUser?.email) {
      if (/[a-zA-Z0-9._%+-]+@organizer\.bookmyspot\.com/i.test(selectedUser.email)) {
        return <Badge bg="primary">Organizer</Badge>;
      }
    }
    
    // Fallback with a more informative badge
    return <Badge bg="secondary">User</Badge>; // Default to User as safest option
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge bg="success">Active</Badge>;
      case 'Inactive':
        return <Badge bg="danger">Inactive</Badge>;
      case 'Pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Rejected':
        return <Badge bg="secondary">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container my-4"
    >
      <h2 className="mb-2">User Management</h2>
      <p className="text-muted mb-4">Manage users and organizers. Admin accounts are not displayed for security reasons.</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex gap-2 w-75">
          <InputGroup className="w-50">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users by name, email or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </InputGroup>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="role-filter">
              <FaFilter className="me-2" />
              {roleFilter === 'all' ? 'All Roles' : `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setRoleFilter('all')}>All Roles</Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter('organizer')}>Organizers</Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter('user')}>Users</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        
        <Button variant="primary" onClick={fetchUsers} disabled={loading}>
          Refresh
        </Button>
      </div>
      
      {loading && !showModal ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-2">
                          <FaUserAlt />
                        </div>
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{getRoleBadge(user.roleId)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/admin/users/${user._id || user.id}`}>
                          <Button variant="info" size="sm">
                            <FaEye /> View
                          </Button>
                        </Link>
                        {user.status === 'Active' ? (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleStatusChange(user, false)}
                          >
                            <FaBan /> Deactivate
                          </Button>
                        ) : (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleStatusChange(user, true)}
                          >
                            <FaCheck /> Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users found{searchInput || roleFilter !== 'all' ? ' matching your search criteria' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
      
      {/* Status Change Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.newStatus
              ? 'Activate User'
              : 'Deactivate User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to 
            <strong>{selectedUser?.newStatus ? ' activate ' : ' deactivate '}</strong>
            the user: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email})?
          </p>
          
          <Form.Group>
            <Form.Label>Reason (optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a reason for this status change..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={selectedUser?.newStatus ? 'success' : 'danger'} 
            onClick={confirmStatusChange}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Processing...
              </>
            ) : (
              `Confirm ${selectedUser?.newStatus ? 'Activation' : 'Deactivation'}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default AdminUserManagement; 