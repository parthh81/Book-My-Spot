import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3200/user/forgotpassword', { email });
      
      if (response.status === 200) {
        setSuccess(true);
        setMessage('Password reset link has been sent to your email address');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 my-5">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-3">Forgot Password</h3>
                {!success && (
                  <p className="text-muted">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                )}
              </div>
              
              {success ? (
                <div className="text-center">
                  <div className="alert alert-success" role="alert">
                    {message}
                  </div>
                  <p className="mt-4">
                    <Link to="/login" className="btn btn-primary">
                      <FaArrowLeft className="me-2" /> Back to Login
                    </Link>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <Link to="/login" className="btn btn-outline-secondary">
                      Back to Login
                    </Link>
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