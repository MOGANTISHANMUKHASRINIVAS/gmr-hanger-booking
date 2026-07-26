import React, { useState, useEffect } from 'react';
import { Plane, Clock, ShieldCheck, User, Menu, PanelLeftClose, PanelLeftOpen, Database, LogOut } from 'lucide-react';
import { getDbStatus } from '../services/bookingService';

const Header = ({ activeTabTitle, isSidebarOpen, onToggleSidebar, currentUser, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dbStatus, setDbStatus] = useState({ database: 'Connecting...', isMongoConnected: false });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkDb = async () => {
      const status = await getDbStatus();
      setDbStatus(status);
    };
    checkDb();
    const interval = setInterval(checkDb, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatStationTime = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' IST';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="btn btn-outline btn-sm"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Tap to Close Navbar Sidebar' : 'Tap to Open Navbar Sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 700,
            padding: '0.45rem 0.75rem',
            backgroundColor: isSidebarOpen ? 'rgba(224, 242, 254, 0.6)' : '#0284c7',
            color: isSidebarOpen ? '#0284c7' : '#ffffff',
            border: '1.5px solid #0284c7',
            transition: 'all 0.2s ease'
          }}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          <span>{isSidebarOpen ? 'Close Menu' : 'Open Menu'}</span>
        </button>

        <h1 className="page-title" style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeTabTitle}</h1>
        <span className="station-badge">
          HYD / HYDERABAD MRO BASE
        </span>
      </div>

      <div className="header-right">
        {/* Live MongoDB Status Indicator */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: dbStatus.isMongoConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${dbStatus.isMongoConnected ? '#10b981' : '#f59e0b'}`,
            color: dbStatus.isMongoConnected ? '#065f46' : '#92400e',
            fontSize: '0.78rem',
            fontWeight: 700
          }}
          title={dbStatus.isMongoConnected ? 'MongoDB Atlas Connected & Active' : 'MongoDB Offline / Fallback Storage'}
        >
          <Database size={14} style={{ color: dbStatus.isMongoConnected ? '#10b981' : '#f59e0b' }} />
          <span>{dbStatus.isMongoConnected ? 'MongoDB Connected' : 'Local Persistence'}</span>
        </div>

        <div className="time-widget" title="Live Station Control Time">
          <Clock size={16} className="text-muted" />
          <span>{formatStationTime(currentTime)}</span>
        </div>

        {/* Authenticated User Profile & Logout */}
        <div className="user-profile">
          <div className="user-avatar" title={currentUser?.name || 'Duty Controller'}>
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name" style={{ fontWeight: 800 }}>{currentUser?.name || 'Shanmukha Srinivasa Moganti'}</span>
            <span className="user-role">{currentUser?.role || 'Shift Lead Controller'}</span>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-danger btn-sm"
              style={{
                marginLeft: '0.5rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Sign Out of Station Account"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
