import React from 'react';
import { FaCalendarAlt, FaUsers, FaHeart, FaClock } from 'react-icons/fa';

export const UserHome = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard</h1>
      
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(0, 150, 255, 0.1)',
                  color: '#0096FF'
                }}
              >
                <FaCalendarAlt style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Upcoming Events</div>
                <div className="fw-bold fs-4">3</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(240, 85, 55, 0.1)',
                  color: '#f05537'
                }}
              >
                <FaUsers style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Bookings</div>
                <div className="fw-bold fs-4">12</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545'
                }}
              >
                <FaHeart style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Saved Venues</div>
                <div className="fw-bold fs-4">5</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  color: '#28a745'
                }}
              >
                <FaClock style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Recent Views</div>
                <div className="fw-bold fs-4">8</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Upcoming Bookings</h5>
            </div>
            <div className="card-body">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Venue</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Royal Grand Palace</td>
                    <td>15 Dec 2023</td>
                    <td>6:00 PM</td>
                    <td><span className="badge bg-success">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>Modern Event Center</td>
                    <td>22 Dec 2023</td>
                    <td>2:00 PM</td>
                    <td><span className="badge bg-warning text-dark">Pending</span></td>
                  </tr>
                  <tr>
                    <td>Riverside Retreat</td>
                    <td>05 Jan 2024</td>
                    <td>7:30 PM</td>
                    <td><span className="badge bg-success">Confirmed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Recently Viewed</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Modern Event Center" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Modern Event Center</div>
                      <div className="small text-muted">Viewed 2 hours ago</div>
                    </div>
                  </div>
                </li>
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Riverside Retreat" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Riverside Retreat</div>
                      <div className="small text-muted">Viewed 5 hours ago</div>
                    </div>
                  </div>
                </li>
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Royal Grand Palace" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Royal Grand Palace</div>
                      <div className="small text-muted">Viewed 1 day ago</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 