import React from 'react';
import EventsTable from '../components/organizer/EventsTable';
import '../styles/organizer.css';
import '../styles/events.css';

const OrganizerEventsPage = () => {
  return (
    <>
      <div className="page-content" style={{ padding: '0', margin: '0', border: 'none', outline: 'none' }}>
        <EventsTable />
      </div>
    </>
  );
};

export default OrganizerEventsPage;