import React from 'react';
import EventBrowse from '../components/user/EventBrowse';
import Navbar from '../components/common/NavBar';
import '../styles/events.css';

const BrowseEventsPage = () => {
  return (
    <div className="browse-events-page">
      {/* Include the Navbar at the top */}
      <Navbar />
      
      {/* Main content area with proper spacing from navbar */}
      <div className="content-wrapper" style={{ paddingTop: '80px' }}>
        <EventBrowse />
      </div>
    </div>
  );
};

export default BrowseEventsPage; 