import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  History,
  Grid,
  Settings as SettingsIcon,
  Plane,
  X
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-booking', label: 'New Booking', icon: PlusCircle },
  { id: 'calendar', label: 'Calendar View', icon: Calendar },
  { id: 'booking-history', label: 'Booking History', icon: History },
  { id: 'hangar-status', label: 'Hangar Status', icon: Grid },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
];

const Sidebar = ({ activeTab, setActiveTab, isOpen, onToggleSidebar }) => {
  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar-logo-icon">
            <Plane size={22} />
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-title">GMR Aero</span>
            <span className="sidebar-brand-subtitle">Technic MRO</span>
          </div>
        </div>
        <button
          className="close-btn"
          onClick={onToggleSidebar}
          title="Close Sidebar Menu"
          style={{ color: '#38bdf8' }}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>Bay Slots Operational</div>
        <div className="shift-status-badge">
          <span className="status-dot-pulse"></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Shift Alpha Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
