import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  Database, 
  Server, 
  ShieldAlert, 
  CheckCircle2,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { resetToInitialData, getDbStatus } from '../services/bookingService';

const Settings = ({ showToast, onDatabaseReset }) => {
  const [dbStatus, setDbStatus] = useState({ database: 'Checking...', isMongoConnected: false, totalBookings: 0 });
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getDbStatus();
      setDbStatus(status);
    };
    fetchStatus();
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Reset all MongoDB hangar bookings to default initial state? This will restore original seed bookings.')) {
      setIsResetting(true);
      try {
        await resetToInitialData();
        showToast('MongoDB database reset to initial MRO seed dataset.', 'success');
        if (onDatabaseReset) onDatabaseReset();
      } catch (err) {
        showToast('Failed to reset database.', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="settings-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="form-container" style={{ margin: 0, maxWidth: 'none' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '1rem' }}>
          <h2 className="section-title">
            <SettingsIcon size={20} className="text-muted" />
            <span>MRO Control Center Configuration</span>
          </h2>
          <p className="text-muted text-sm">
            Station configuration parameters, MongoDB API endpoint settings, and database management.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Station Info Card */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Building2 size={18} className="text-muted" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                Station Profile: GMR Aero Technic MRO
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Location:</strong> Rajiv Gandhi International Airport (HYD)</div>
              <div><strong>Total Bays:</strong> 12 Heavy & Line Hangars</div>
              <div><strong>Active Shift:</strong> Alpha Shift (06:00 - 18:00)</div>
              <div><strong>Avionics System:</strong> Enterprise MRO v4.8 (MongoDB Engine)</div>
            </div>
          </div>

          {/* MongoDB API Connection Card */}
          <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Database size={18} style={{ color: dbStatus.isMongoConnected ? '#10b981' : '#f59e0b' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                MongoDB Database Engine Status
              </h3>
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Connected to Node.js/Express REST API with Mongoose ODM database layer on port 5000.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span 
                className={`status-badge ${dbStatus.isMongoConnected ? 'available' : 'occupied'}`} 
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                {dbStatus.isMongoConnected ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {dbStatus.isMongoConnected ? 'MongoDB Connected' : 'Local Persistence Fallback'}
              </span>
              <span className="station-badge" style={{ textTransform: 'none' }}>
                URI: {dbStatus.mongoUri || 'mongodb://localhost:27017/gmr_hangar_db'}
              </span>
              <span className="station-badge" style={{ textTransform: 'none', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                Total Records: {dbStatus.totalBookings || 0}
              </span>
            </div>
          </div>

          {/* Database Reset Action */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                Reset Station MongoDB Database
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-700)', marginBottom: '1rem' }}>
              Restores initial seed bookings in MongoDB for all 12 hangars across Airbus and Boeing models.
            </p>
            <button className="btn btn-danger btn-sm" onClick={handleResetData} disabled={isResetting}>
              <RotateCcw size={14} />
              <span>{isResetting ? 'Resetting MongoDB...' : 'Reset MongoDB to Initial Seed Bookings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
