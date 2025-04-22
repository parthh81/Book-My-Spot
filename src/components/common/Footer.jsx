import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 pt-5 pb-4">
      <div className="container">
        <div className="row">
          <div className="col-md-3 col-sm-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4" style={{ color: '#f05537' }}>BookMySpot</h5>
            <p className="mb-3">Your one-stop solution for booking event venues, conferences, and more.</p>
            <div className="d-flex social-icons">
              <a href="#" className="me-3 text-white"><FaFacebookF /></a>
              <a href="#" className="me-3 text-white"><FaTwitter /></a>
              <a href="#" className="me-3 text-white"><FaInstagram /></a>
              <a href="#" className="text-white"><FaLinkedinIn /></a>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4" style={{ color: '#f05537' }}>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/events" className="text-white text-decoration-none">Events</Link></li>
              <li className="mb-2"><Link to="/help" className="text-white text-decoration-none">Help Center</Link></li>
              <li className="mb-2"><Link to="/about" className="text-white text-decoration-none">About Us</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4" style={{ color: '#f05537' }}>Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/help" className="text-white text-decoration-none">FAQ</Link></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Terms & Conditions</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Cancellation Policy</a></li>
            </ul>
          </div>
          
          <div className="col-md-3 col-sm-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4" style={{ color: '#f05537' }}>Contact Us</h5>
            <ul className="list-unstyled contact-info">
              <li className="mb-3 d-flex align-items-start">
                <span className="me-2 mt-1"><FaMapMarkerAlt /></span>
                <span>123 Venue Street, Eventville, Mumbai, 400001</span>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <span className="me-2 mt-1"><FaPhone /></span>
                <span>+91 (123) 456-7890</span>
              </li>
              <li className="d-flex align-items-start">
                <span className="me-2 mt-1"><FaEnvelope /></span>
                <span>support@bookmyspot.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4 bg-light" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0">© {new Date().getFullYear()} BookMySpot. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item"><a href="#" className="text-white text-decoration-none">Terms</a></li>
              <li className="list-inline-item ms-3"><a href="#" className="text-white text-decoration-none">Privacy</a></li>
              <li className="list-inline-item ms-3"><a href="#" className="text-white text-decoration-none">Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 