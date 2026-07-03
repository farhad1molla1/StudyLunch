import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import '../styles/layout.css'; // Load layout design engine rules

function MainLayout() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--sl-bg)'
    }}>
      {/* Global Top Navigation Bar */}
      <Navbar />

      {/* Main Structural Wrapper */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left Side Navigation Pane (Responsive) */}
        <Sidebar />

        {/* Dynamic Scrollable Content Workspace Container */}
        <main className="scroll-container" style={{
          flex: 1,
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <Outlet /> {/* Target Child Page Injector Segment */}
        </main>
      </div>

      {/* Mobile Device Bottom Bar Controller */}
      <BottomNavigation />
    </div>
  );
}

export default MainLayout;