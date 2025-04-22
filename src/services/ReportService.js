/**
 * ReportService handles report generation functionality
 */
export default class ReportService {
  /**
   * Generate and download a report based on dashboard data
   * @param {Object} dashboardData - The dashboard data to include in the report
   * @param {string} timeframe - The timeframe for the report (week, month, quarter, year)
   * @param {string} format - The format of the report (csv, pdf)
   * @returns {boolean} Success status of the report generation
   */
  static async generateReport(dashboardData, timeframe = 'month', format = 'csv') {
    try {
      console.log(`Generating ${format} report for timeframe:`, timeframe);
      
      if (!dashboardData || !dashboardData.stats) {
        console.error('Invalid dashboard data for report generation');
        return false;
      }
      
      // Format the current date for the filename
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Generate the report based on the requested format
      if (format === 'pdf') {
        return await this.generatePdfReport(dashboardData, timeframe, dateString);
      } else {
        return await this.generateCsvReport(dashboardData, timeframe, dateString);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      return false;
    }
  }

  /**
   * Generate and download a CSV report
   * @param {Object} dashboardData - The dashboard data to include in the report
   * @param {string} timeframe - The timeframe for the report
   * @param {string} dateString - The formatted date string for the filename
   * @returns {boolean} Success status of the report generation
   */
  static async generateCsvReport(dashboardData, timeframe, dateString) {
    try {
      // Create CSV content starting with headers
      let csvContent = 'BookMySpot Admin Report\n';
      csvContent += `Generated on: ${new Date().toLocaleString()}\n`;
      csvContent += `Timeframe: ${timeframe}\n\n`;
      
      // Add summary statistics
      csvContent += 'Summary Statistics\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Users,${dashboardData.stats.totalUsers || 0}\n`;
      csvContent += `Total Organizers,${dashboardData.stats.totalOrganizers || 0}\n`;
      csvContent += `Total Events,${dashboardData.stats.totalEvents || 0}\n`;
      csvContent += `Total Bookings,${dashboardData.stats.totalBookings || 0}\n`;
      csvContent += `Total Revenue,₹${dashboardData.stats.totalRevenue || 0}\n`;
      csvContent += `Pending Approvals,${dashboardData.stats.pendingApprovals || 0}\n\n`;
      
      // Add revenue data if available
      if (dashboardData.revenueData && dashboardData.revenueData.labels) {
        csvContent += 'Monthly Revenue\n';
        csvContent += 'Month,Revenue (₹)\n';
        
        dashboardData.revenueData.labels.forEach((month, index) => {
          const revenue = dashboardData.revenueData.data[index] || 0;
          csvContent += `${month},${revenue}\n`;
        });
        csvContent += '\n';
      }
      
      // Add booking category data if available
      if (dashboardData.bookingsByCategory && dashboardData.bookingsByCategory.labels) {
        csvContent += 'Bookings by Category\n';
        csvContent += 'Category,Count\n';
        
        dashboardData.bookingsByCategory.labels.forEach((category, index) => {
          const count = dashboardData.bookingsByCategory.data[index] || 0;
          csvContent += `${category},${count}\n`;
        });
        csvContent += '\n';
      }
      
      // Add recent users if available
      if (dashboardData.recentUsers && dashboardData.recentUsers.length > 0) {
        csvContent += 'Recent Users\n';
        csvContent += 'Name,Email,Role,Status\n';
        
        dashboardData.recentUsers.forEach(user => {
          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          csvContent += `${name},${user.email || ''},${user.role || ''},${user.status || ''}\n`;
        });
        csvContent += '\n';
      }
      
      // Add recent bookings if available
      if (dashboardData.recentBookings && dashboardData.recentBookings.length > 0) {
        csvContent += 'Recent Bookings\n';
        csvContent += 'Customer,Event,Date,Amount,Status\n';
        
        dashboardData.recentBookings.forEach(booking => {
          csvContent += `${booking.customer || ''},${booking.eventName || ''},${booking.date || ''},₹${booking.amount || 0},${booking.status || ''}\n`;
        });
      }
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookmyspot_report_${timeframe}_${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('CSV Report generated and download triggered');
      return true;
    } catch (error) {
      console.error('Error generating CSV report:', error);
      return false;
    }
  }

  /**
   * Generate and download a PDF report
   * @param {Object} dashboardData - The dashboard data to include in the report
   * @param {string} timeframe - The timeframe for the report
   * @param {string} dateString - The formatted date string for the filename
   * @returns {boolean} Success status of the report generation
   */
  static async generatePdfReport(dashboardData, timeframe, dateString) {
    try {
      // First, check if jspdf is available
      if (typeof window.jspdf === 'undefined') {
        // Dynamically import jspdf if not available
        await this.loadJsPdf();
      }
      
      // Create a new jsPDF instance
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add report title and metadata
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('BookMySpot Admin Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
      doc.text(`Timeframe: ${timeframe}`, 105, 35, { align: 'center' });
      
      // Add a divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 40, 190, 40);
      
      // Add summary statistics section
      doc.setFontSize(14);
      doc.text('Summary Statistics', 20, 50);
      
      doc.setFontSize(10);
      let yPosition = 60;
      
      // Create a simple 2-column table for stats
      doc.setTextColor(100, 100, 100);
      doc.text('Metric', 25, yPosition);
      doc.text('Value', 100, yPosition);
      yPosition += 5;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setTextColor(40, 40, 40);
      
      // Add each statistic
      const stats = [
        { label: 'Total Users', value: dashboardData.stats.totalUsers || 0 },
        { label: 'Total Organizers', value: dashboardData.stats.totalOrganizers || 0 },
        { label: 'Total Events', value: dashboardData.stats.totalEvents || 0 },
        { label: 'Total Bookings', value: dashboardData.stats.totalBookings || 0 },
        { label: 'Total Revenue', value: `₹${dashboardData.stats.totalRevenue || 0}` },
        { label: 'Pending Approvals', value: dashboardData.stats.pendingApprovals || 0 }
      ];
      
      stats.forEach(stat => {
        doc.text(stat.label, 25, yPosition);
        doc.text(String(stat.value), 100, yPosition);
        yPosition += 8;
      });
      
      // Add a divider
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      // Add revenue data if available
      if (dashboardData.revenueData && dashboardData.revenueData.labels) {
        doc.setFontSize(14);
        doc.text('Monthly Revenue', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Month', 25, yPosition);
        doc.text('Revenue (₹)', 100, yPosition);
        yPosition += 5;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.setTextColor(40, 40, 40);
        
        // Add each month's revenue
        dashboardData.revenueData.labels.forEach((month, index) => {
          if (yPosition > 270) {
            // Add a new page if we're running out of space
            doc.addPage();
            yPosition = 20;
          }
          
          const revenue = dashboardData.revenueData.data[index] || 0;
          doc.text(month, 25, yPosition);
          doc.text(String(revenue), 100, yPosition);
          yPosition += 8;
        });
        
        // Add a divider
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 15;
      }
      
      // Add booking category data if available
      if (dashboardData.bookingsByCategory && dashboardData.bookingsByCategory.labels) {
        if (yPosition > 250) {
          // Add a new page if we're running out of space
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Bookings by Category', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Category', 25, yPosition);
        doc.text('Count', 100, yPosition);
        yPosition += 5;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.setTextColor(40, 40, 40);
        
        // Add each category
        dashboardData.bookingsByCategory.labels.forEach((category, index) => {
          const count = dashboardData.bookingsByCategory.data[index] || 0;
          doc.text(category, 25, yPosition);
          doc.text(String(count), 100, yPosition);
          yPosition += 8;
        });
        
        // Add a divider
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 15;
      }
      
      // Add recent users if available
      if (dashboardData.recentUsers && dashboardData.recentUsers.length > 0) {
        if (yPosition > 230) {
          // Add a new page if we're running out of space
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Recent Users', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Name', 20, yPosition);
        doc.text('Email', 65, yPosition);
        doc.text('Role', 145, yPosition);
        doc.text('Status', 175, yPosition);
        yPosition += 5;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.setTextColor(40, 40, 40);
        
        // Add each recent user
        dashboardData.recentUsers.forEach(user => {
          if (yPosition > 270) {
            // Add a new page if we're running out of space
            doc.addPage();
            yPosition = 20;
          }
          
          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          doc.text(name.substring(0, 20), 20, yPosition);
          doc.text(user.email.substring(0, 40) || '', 65, yPosition);
          doc.text(user.role || '', 145, yPosition);
          doc.text(user.status || '', 175, yPosition);
          yPosition += 8;
        });
        
        // Add a divider
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 15;
      }
      
      // Add recent bookings if available
      if (dashboardData.recentBookings && dashboardData.recentBookings.length > 0) {
        if (yPosition > 230) {
          // Add a new page if we're running out of space
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Recent Bookings', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Customer', 20, yPosition);
        doc.text('Event', 65, yPosition);
        doc.text('Date', 125, yPosition);
        doc.text('Amount', 155, yPosition);
        doc.text('Status', 180, yPosition);
        yPosition += 5;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.setTextColor(40, 40, 40);
        
        // Add each recent booking
        dashboardData.recentBookings.forEach(booking => {
          if (yPosition > 270) {
            // Add a new page if we're running out of space
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(booking.customer?.substring(0, 20) || '', 20, yPosition);
          doc.text(booking.eventName?.substring(0, 30) || '', 65, yPosition);
          doc.text(booking.date || '', 125, yPosition);
          doc.text(`₹${booking.amount || 0}`, 155, yPosition);
          doc.text(booking.status || '', 180, yPosition);
          yPosition += 8;
        });
      }
      
      // Save the PDF
      doc.save(`bookmyspot_report_${timeframe}_${dateString}.pdf`);
      
      console.log('PDF Report generated and download triggered');
      return true;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please make sure jsPDF is installed or try exporting as CSV.');
      return false;
    }
  }
  
  /**
   * Load jsPDF library dynamically
   */
  static async loadJsPdf() {
    return new Promise((resolve, reject) => {
      if (window.jspdf) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        console.error('Failed to load jsPDF library');
        reject(new Error('Failed to load jsPDF library'));
      };
      document.head.appendChild(script);
    });
  }
} 