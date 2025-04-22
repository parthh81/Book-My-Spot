import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Validate the token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // You can add a specific endpoint to validate tokens if needed
        // For now, we'll just ensure the token exists
        if (!token) {
          setTokenValid(false);
          setError('Invalid or missing reset token');
        }
        setTokenChecked(true);
      } catch (error) {
        console.error('Error validating token:', error);
        setTokenValid(false);
        setError('Invalid or expired token');
        setTokenChecked(true);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3200/user/resetpassword', {
        token,
        password
      });
      
      if (response.status === 200) {
        setSuccess(true);
        setMessage('Your password has been reset successfully');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while token is being checked
  if (!tokenChecked) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 my-5">
              <div className="card-body p-4 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Validating reset link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 my-5">
              <div className="card-body p-4 text-center">
                <FaExclamationTriangle className="text-danger" size={50} />
                <h3 className="mt-3 mb-3">Invalid Reset Link</h3>
                <p className="text-muted">
                  The password reset link is invalid or has expired.
                </p>
                <div className="mt-4">
                  <Link to="/forgot-password" className="btn btn-primary me-2">
                    Request New Link
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 my-5">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-3">Reset Your Password</h3>
                {!success && (
                  <p className="text-muted">
                    Please enter your new password below.
                  </p>
                )}
              </div>
              
              {success ? (
                <div className="text-center">
                  <FaCheckCircle className="text-success" size={50} />
                  <div className="alert alert-success mt-3" role="alert">
                    {message}
                  </div>
                  <p>Redirecting to login page...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};