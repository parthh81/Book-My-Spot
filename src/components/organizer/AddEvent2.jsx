import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AddEvent2 = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Add Event - Step 2</h1>
      </div>
      
      <div className="alert alert-info">
        This is a placeholder for the AddEvent2 component that will be implemented later.
      </div>
      
      <button 
        className="btn btn-primary"
        onClick={() => navigate('/organizer/events')}
      >
        Back to Events
      </button>
    </div>
  );
};

export default AddEvent2; 