import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/admin.css';

export const AdminSidebar = () => {
  return (
    <div className="admin-layout">
      {/* Main content - sidebar removed */}
      <main className="admin-content">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminSidebar;
