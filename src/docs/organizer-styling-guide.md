# Organizer Component Styling Guide

This document provides guidelines for implementing consistent styling across all organizer components in the BookMySpot application.

## Getting Started

1. Import the common organizer styles in your component:
```jsx
import '../../styles/organizer-common.css';
```

2. Use the `organizer-page-container` class as the main wrapper for your component:
```jsx
<div className="organizer-page-container">
  {/* Your component content here */}
</div>
```

## Page Title

Use the `page-title` class for the main heading:

```jsx
<h1 className="page-title">Your Page Title</h1>
```

## Stats Cards

For displaying statistics cards:

```jsx
<div className="row stats-cards">
  <div className="col-md-3 mb-3">
    <div className="card stats-card primary-card">
      <div className="card-body">
        <h5 className="card-title">Stat Title</h5>
        <p className="stats-value">42</p>
      </div>
    </div>
  </div>
  
  {/* Add more stats cards as needed */}
</div>
```

Card variations:
- `primary-card` (blue)
- `success-card` (green)
- `warning-card` (yellow)
- `danger-card` (red)
- `info-card` (light blue)

## Tables

Use the `organizer-table` class for tables:

```jsx
<table className="table table-hover organizer-table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

For sortable columns:
```jsx
<th className="sortable" onClick={handleSort}>
  Column Name
  {sortField === 'field' && (
    sortDirection === 'asc' ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />
  )}
</th>
```

## Status Badges

Use the following classes for status badges:

```jsx
<span className="badge badge-confirmed">Confirmed</span>
<span className="badge badge-pending">Pending</span>
<span className="badge badge-cancelled">Cancelled</span>
```

## Search and Filters

Place search and filters in a container with appropriate spacing:

```jsx
<div className="search-filter-container">
  <div className="row">
    <div className="col-md-4">
      {/* Search input */}
    </div>
    <div className="col-md-4">
      {/* Filter dropdown */}
    </div>
  </div>
</div>
```

## Loading and Empty States

For loading state:
```jsx
<div className="loading-container">
  <div className="spinner-border text-primary" role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
  <p className="mt-2">Loading data...</p>
</div>
```

For empty state:
```jsx
<div className="empty-state">
  <p>No data found.</p>
</div>
```

## Component Template

Here's a template structure for organizing your components:

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../styles/organizer-common.css';

const YourComponent = () => {
  // State and hooks
  
  return (
    <motion.div 
      className="organizer-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Page Title</h1>
        <button className="btn btn-primary">Action Button</button>
      </div>
      
      {/* Stats Cards */}
      <div className="row stats-cards">
        {/* Stats cards here */}
      </div>
      
      {/* Search and Filters */}
      <div className="search-filter-container">
        {/* Search and filters here */}
      </div>
      
      {/* Main Content */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">Section Title</h3>
        </div>
        <div className="card-body">
          {/* Content here */}
        </div>
      </div>
    </motion.div>
  );
};

export default YourComponent;
```

## Animation

For consistent animations, use Framer Motion:

```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

## Colors

Use these color codes for consistency:
- Primary: #4e73df
- Success: #28a745
- Warning: #ffc107
- Danger: #e74a3b
- Info: #36b9cc
- Orange (Brand): #f05537

For custom buttons matching the brand color:
```jsx
<button 
  className="btn btn-primary" 
  style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
>
  Button Text
</button>
``` 