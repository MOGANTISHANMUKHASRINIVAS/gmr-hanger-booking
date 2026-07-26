import React from 'react';
import { Plane, ArrowRight, Calendar } from 'lucide-react';

const WelcomePage = ({ onGetStarted }) => {
  return (
    <div className="fullscreen-welcome-portal">
      {/* 8K Crystal Clear Background Image — Zero Blur, Pure Clarity */}
      <div className="welcome-bg-image-layer"></div>

      {/* Top Left Minimalist Glass Brand Badge */}
      <div className="welcome-top-brand">
        <div className="brand-logo-box">
          <Plane size={28} style={{ color: '#38bdf8' }} />
        </div>
        <div className="brand-text">
          <span className="brand-main">GMR AERO TECHNIC</span>
          <span className="brand-sub">RGIA HYDERABAD MRO BASE</span>
        </div>
      </div>

      {/* Small Hangar Booking Glass Badge at Bottom Left Corner */}
      <div className="welcome-bottom-left-badge">
        <div className="small-glass-badge">
          <Calendar size={18} style={{ color: '#38bdf8' }} />
          <span>Hangar Booking</span>
        </div>
      </div>

      {/* Prominent 8K Glass "GET STARTED" Button at Bottom Right Corner */}
      <div className="welcome-bottom-right-action">
        <button 
          className="get-started-btn-8k"
          onClick={() => onGetStarted('dashboard')}
          title="Enter GMR Aero Technic MRO Control Console"
        >
          <span>GET STARTED</span>
          <ArrowRight size={26} className="arrow-pulse" />
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
