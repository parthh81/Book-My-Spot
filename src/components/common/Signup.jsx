import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

// Add a style tag to ensure any existing CSS is overridden
const styleOverrides = `
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    min-height: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  #root {
    position: relative;
    min-height: 100vh;
    height: 100%;
  }
`;

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userRole, setUserRole] = useState('user'); // Default role is user
  
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, dirtyFields },
    reset,
    watch
  } = useForm({
    mode: 'onChange'
  });

  const password = watch('password', '');
  const email = watch('email', '');
  const firstName = watch('firstName', '');
  const lastName = watch('lastName', '');

  // Handle screen resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect caps lock
  const handleKeyDown = (e) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    // Simplified strength calculation - only based on length
    let strength = 0;
    if (password.length >= 4) strength += 1;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthLabel = () => {
    switch(passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#ff3e3e';
      case 1: return '#ff6b3e';
      case 2: return '#ffcc3e';
      case 3: return '#b6e245';
      case 4: return '#4caf50';
      default: return '#ccc';
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSignupError('');
    setSignupSuccess('');
    
    try {
      // Get the appropriate roleId based on user selection
      const roleId = userRole === 'user' 
        ? '67bfea7a9e9b1ff35394c90d'  // User role ID
        : '67eec81cdc0688d1102e953e'; // Updated Organizer ID
      
      // Add the complete base URL to your API
      const response = await fetch('http://localhost:3200/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          roleId: roleId
        }),
      });
      
      // Only try to parse JSON if the response has content
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { message: 'Server returned non-JSON response' };
      }
      
      if (!response.ok) {
        setSignupError(result?.message || `Registration failed (${response.status})`);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setSignupSuccess('Account created successfully! Redirecting to login...');
        reset();
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      setSignupError(`Connection error: ${error.message}`);
      console.error('Signup error:', error);
    }
  };

  return (
    <>
      {/* Add a style tag to apply global styles */}
      <style>{styleOverrides}</style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        backgroundImage: 'linear-gradient(to bottom right, #f7f7f7, #eaeaea)',
        minHeight: '100vh',
        height: '100%',
        width: '100%',
        padding: isSmallScreen ? '0' : '10px 0', // Small padding on desktop only
        margin: '0',
        boxSizing: 'border-box' // Ensure padding is included in height calculation
      }}
      className="signup-container"
      >
        <div style={{
          width: '100%',
          maxWidth: isSmallScreen ? '480px' : '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          boxShadow: '0 5px 30px rgba(0, 0, 0, 0.15)',
          borderRadius: isSmallScreen ? '0' : '8px', // No rounded corners on mobile for full-screen look
          overflow: 'hidden',
          backgroundColor: '#fff',
          height: isSmallScreen ? 'auto' : '100vh',
          maxHeight: isSmallScreen ? 'none' : 'calc(100vh - 20px)' // Account for padding
        }}>
          {/* Left side - Form */}
          <div style={{
            flex: 1,
            padding: isSmallScreen ? '25px' : '40px',
            order: isSmallScreen ? 2 : 1,
            height: isSmallScreen ? 'auto' : 'auto', // Auto height but with overflow
            maxHeight: isSmallScreen ? 'none' : 'calc(100vh - 20px)', // Match container's max height
            overflowY: 'auto' // Always allow scrolling for form content
          }}>
            <h2 style={{
              fontSize: '24px',
              color: '#f05537',
              fontWeight: 'bold',
              marginBottom: '30px',
              transition: 'color 0.3s ease'
            }}>BookMySpot</h2>
            
            <h1 style={{
              fontSize: isSmallScreen ? '24px' : '28px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>Create Account</h1>
            
            <p style={{
              color: '#6c757d',
              marginBottom: '30px'
            }}>Join BookMySpot and start exploring amazing venues</p>
            
            {signupError && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(255, 62, 62, 0.1)',
                border: '1px solid rgba(255, 62, 62, 0.3)',
                borderRadius: '4px',
                color: '#d32f2f',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaExclamationTriangle />
                <span>{signupError}</span>
                <button
                  onClick={() => setSignupError('')}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#d32f2f'
                  }}
                  aria-label="Close error message"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            
            {signupSuccess && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '4px',
                color: '#4caf50',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaCheck />
                <span>{signupSuccess}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                flexDirection: isSmallScreen ? 'column' : 'row'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>First Name</label>
                  <input
                    {...register('firstName', { 
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    placeholder="Enter your first name"
                    aria-label="First Name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.firstName ? '1px solid #ff3e3e' : touchedFields.firstName && firstName && !errors.firstName ? '1px solid #4caf50' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    className="input-focus"
                  />
                  {errors.firstName && <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '5px' }}>{errors.firstName.message}</p>}
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>Last Name</label>
                  <input
                    {...register('lastName', { 
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    placeholder="Enter your last name"
                    aria-label="Last Name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.lastName ? '1px solid #ff3e3e' : touchedFields.lastName && lastName && !errors.lastName ? '1px solid #4caf50' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    className="input-focus"
                  />
                  {errors.lastName && <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '5px' }}>{errors.lastName.message}</p>}
                </div>
              </div>
              
              {/* Grouped Email & Phone Fields */}
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  marginBottom: '20px',
                  flexDirection: isSmallScreen ? 'column' : 'row'
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Email Address
                  </label>
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
                      border: errors.email ? '1px solid #ff3e3e' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    className="input-focus"
                  />
                  {errors.email && <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '5px' }}>{errors.email.message}</p>}
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Phone Number
                  </label>
                  <input
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                    type="tel"
                    placeholder="Enter your phone number"
                    aria-label="Phone Number"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.phone ? '1px solid #ff3e3e' : touchedFields.phone && !errors.phone ? '1px solid #4caf50' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    className="input-focus"
                  />
                  {errors.phone && <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '5px' }}>{errors.phone.message}</p>}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    aria-label="Password"
                    onKeyDown={handleKeyDown}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.password ? '1px solid #ff3e3e' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    className="input-focus"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                {errors.password && <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '5px' }}>{errors.password.message}</p>}
                {capsLockOn && (
                  <p style={{ color: '#ff9800', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaExclamationTriangle /> Caps lock is on
                  </p>
                )}

                {/* Password strength indicator */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', height: '4px', marginBottom: '5px', gap: '4px' }}>
                      {[...Array(4)].map((_, index) => (
                        <div 
                          key={index} 
                          style={{
                            flex: 1,
                            height: '100%',
                            backgroundColor: index < passwordStrength ? getStrengthColor() : '#e0e0e0',
                            transition: 'background-color 0.3s ease',
                            borderRadius: '2px'
                          }}
                        ></div>
                      ))}
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      display: 'block', 
                      textAlign: 'right',
                      color: getStrengthColor()
                    }}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                )}
                
                {/* Simplified password requirements */}
                {password.length < 8 && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Password requirements:</p>
                    <ul style={{ margin: '0', padding: '0 0 0 20px', fontSize: '12px' }}>
                      <li style={{ color: password.length >= 8 ? '#4caf50' : '#6c757d' }}>
                        At least 8 characters
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>Account Type</label>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setUserRole('user')}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #ddd',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: '8px',
                      backgroundColor: userRole === 'user' ? '#f05537' : 'transparent'
                    }}>
                      {userRole === 'user' && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>
                    <span style={{ color: '#333', fontSize: '14px' }}>User</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setUserRole('organizer')}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #ddd',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: '8px',
                      backgroundColor: userRole === 'organizer' ? '#f05537' : 'transparent'
                    }}>
                      {userRole === 'organizer' && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>
                    <span style={{ color: '#333', fontSize: '14px' }}>Organizer</span>
                  </div>
                </div>
                <p style={{ color: '#6c757d', fontSize: '12px', marginTop: '8px' }}>
                  {userRole === 'user' 
                    ? 'Sign up as a user to book venues and attend events.' 
                    : 'Sign up as an organizer to list venues and create events.'}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '25px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: touchedFields.terms && errors.terms ? 'rgba(255, 62, 62, 0.05)' : 'transparent',
                border: touchedFields.terms && errors.terms ? '1px solid rgba(255, 62, 62, 0.3)' : '1px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="checkbox"
                  id="terms"
                  {...register('terms', { 
                    required: 'You must agree to the Terms of Service and Privacy Policy'
                  })}
                  style={{
                    marginRight: '10px',
                    marginTop: '3px',
                    width: '16px',
                    height: '16px',
                    accentColor: '#f05537'
                  }}
                />
                <label htmlFor="terms" style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  lineHeight: '1.5'
                }}>
                  I agree to the <Link to="/terms" style={{ color: '#f05537', textDecoration: 'none', fontWeight: 'bold' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#f05537', textDecoration: 'none', fontWeight: 'bold' }}>Privacy Policy</Link>
                </label>
              </div>
              {errors.terms && (
                <p style={{ color: '#ff3e3e', fontSize: '12px', marginTop: '-20px', marginBottom: '20px' }}>
                  {errors.terms.message}
                </p>
              )}
              
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
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.7 : 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#d04428')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#f05537')}
              >
                Create Account
                {isLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s infinite',
                    transform: 'skewX(-20deg)',
                  }}></div>
                )}
              </button>
              
              <div style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#6c757d'
              }}>
                Already have an account? <Link 
                  to="/login" 
                  style={{
                    color: '#f05537',
                    textDecoration: 'none', 
                    fontWeight: 'bold',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#d04428'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#f05537'}
                >Sign In</Link>
              </div>
            </form>
          </div>
          
          {/* Right side - Image */}
          <div style={{
            flex: 1,
            backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: isSmallScreen ? 'none' : 'block',
            order: isSmallScreen ? 1 : 2,
            height: 'auto', // Auto height to match container
            minHeight: isSmallScreen ? '200px' : 'calc(100vh - 20px)', // Match container's height
            maxHeight: 'calc(100vh - 20px)' // Match container's max height
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
              <div style={{
                textAlign: 'center',
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}>Find Your Perfect Venue</h2>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>Join thousands of users discovering the best venues for their events with BookMySpot.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .input-focus:focus {
          box-shadow: 0 0 0 2px rgba(240, 85, 55, 0.2);
          border-color: #f05537 !important;
          outline: none;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }
        
        /* Add responsive scrolling */
        @media (max-height: 800px) {
          .signup-container {
            height: auto;
            min-height: 100vh;
            padding: 0;
          }
        }
        
        /* Add height styles to html and body */
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
};

export default Signup;
