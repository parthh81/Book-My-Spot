import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthService from '../../services/AuthService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Clear any existing auth data when login page is loaded
  useEffect(() => {
    AuthService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('isOrganizer');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Helper function for direct login as organizer (testing only)
  const loginAsOrganizer = () => {
    console.log('Direct login as organizer for testing');
    const userData = {
      id: Date.now().toString(),
      role: 'organizer',
      isOrganizer: 'true',
      firstName: 'Test',
      lastName: 'Organizer',
      email: 'test.organizer@example.com'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    AuthService.setAuthData({
      token: mockToken,
      ...userData
    });
    
    setLoginSuccess('Login successful as organizer! Redirecting...');
    setTimeout(() => {
      navigate('/organizer/dashboard', { replace: true });
    }, 1000);
  };

  // Helper function for direct login as user (testing only)
  const loginAsUser = () => {
    console.log('Direct login as user for testing');
    const userData = {
      id: Date.now().toString(),
      role: 'user',
      isOrganizer: 'false',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    AuthService.setAuthData({
      token: mockToken,
      ...userData
    });
    
    setLoginSuccess('Login successful as user! Redirecting...');
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  // Helper function for direct login as admin (testing only)
  const loginAsAdmin = () => {
    console.log('Direct login as admin for testing');
    const userData = {
      id: '67cfb7d6290b3ce5f32524da',
      role: 'admin',
      isOrganizer: 'false',
      isAdmin: 'true',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    AuthService.setAuthData({
      token: mockToken,
      ...userData
    });
    
    setLoginSuccess('Login successful as admin! Redirecting...');
    setTimeout(() => {
      navigate('/admin/dashboard', { replace: true });
    }, 1000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    setLoginSuccess('');
    
    try {
      console.log('Attempting login with:', data.email);
      
      // Using the backend login endpoint
      const response = await fetch('http://localhost:3200/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });
      
      const result = await response.json();
      
      if (response.status === 200) {
        const userData = result.data;
        const authData = {
          token: result.token || 'mock-token',
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.roleId?.name === 'Admin' ? 'admin' :
                (userData.roleId?.name === 'Organizer' ? 'organizer' : 'user'),
          isOrganizer: (userData.roleId?.name === 'Organizer').toString(),
          isAdmin: (userData.roleId?.name === 'Admin').toString()
        };
        
        AuthService.setAuthData(authData);
        setLoginSuccess('Login successful! Redirecting...');
        reset();
        setTimeout(() => {
          let redirectPath = '/';
          if (authData.role === 'admin') {
            redirectPath = '/admin/dashboard';
          } else if (authData.role === 'organizer') {
            redirectPath = '/organizer/dashboard';
          }
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        setLoginError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message || 'Authentication failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      zIndex: 1000
    }}>
      <div style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* Left side - Form */}
        <div style={{ flex: 1, padding: '40px' }}>
          <h2 style={{ fontSize: '24px', color: '#f05537', fontWeight: 'bold', marginBottom: '30px' }}>BookMySpot</h2>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: '#6c757d', marginBottom: '30px' }}>Login to your account to continue</p>
          
          {loginError && (
            <div style={{
              padding: '10px 15px',
              backgroundColor: '#ffebee',
              color: '#d32f2f',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {loginError}
            </div>
          )}
          
          {loginSuccess && (
            <div style={{
              padding: '10px 15px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {loginSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                placeholder="name@example.com"
                aria-label="Email Address"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.email ? '1px solid red' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#333'
                }}
              />
              {errors.email && <p style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</p>}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? "text" : "password"}
                  placeholder="enter your password"
                  aria-label="Password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.password ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <FaEyeSlash style={{ color: '#333' }} /> : <FaEye style={{ color: '#333' }} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</p>}
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/forgotpassword" style={{ color: '#f05537', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Forgot Password?</Link>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f05537',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            {isLoading && <p style={{ color: '#6c757d', fontSize: '14px' }}>Please wait...</p>}
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#6c757d' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#f05537', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
            </div>
          </form>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', textAlign: 'center' }}>
              Having trouble logging in? <Link to="/help" style={{ color: '#f05537', textDecoration: 'none', fontWeight: 'bold' }}>Get Help</Link>
            </p>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div style={{
          flex: 1,
          backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Welcome Back</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Continue your journey with BookMySpot and discover amazing venues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
