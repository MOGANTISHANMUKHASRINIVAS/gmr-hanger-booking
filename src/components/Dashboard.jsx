import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CalendarDays,
  Plane,
  ArrowRight,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { getHangarStatuses, getBookings, deleteBooking, TOTAL_HANGARS } from '../services/bookingService';

const Dashboard = ({ onNavigateToNewBooking, onViewBookingDetail, showToast, triggerRefresh }) => {
  // Operational reference date state (defaults to 2026-07-24)
  const [operationalDate, setOperationalDate] = useState('2026-07-24');
  const [cancelTarget, setCancelTarget] = useState(null);

  // Compute hangar status matrix for the selected operational date
  const hangars = getHangarStatuses(`${operationalDate}T12:00:00.000Z`);
  const allBookings = getBookings();
  const selectedDateObj = new Date(`${operationalDate}T12:00:00.000Z`);

  const occupiedCount = hangars.filter(h => h.isOccupied).length;
  const availableCount = TOTAL_HANGARS - occupiedCount;

  // Handle Cancel Reservation
  const confirmCancelReservation = async () => {
    if (!cancelTarget) return;
    try {
      await deleteBooking(cancelTarget.id);
      if (showToast) showToast(`Reservation for ${cancelTarget.aircraftReg} in ${cancelTarget.hangarId} cancelled successfully!`, 'success');
      if (triggerRefresh) triggerRefresh();
      setCancelTarget(null);
    } catch (err) {
      if (showToast) showToast('Failed to cancel reservation.', 'error');
    }
  };

  // Calculate bookings active on the selected operational date
  const activeBookingsForDate = allBookings.filter(b => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    return (
      selectedDateObj >= new Date(start.setHours(0,0,0,0)) &&
      selectedDateObj <= new Date(end.setHours(23,59,59,999))
    );
  }).length;

  // Calculate upcoming bookings starting after the selected operational date
  const upcomingBookingsForDate = allBookings.filter(b => {
    const start = new Date(b.startDate);
    return start > selectedDateObj;
  }).length;

  // Navigation helpers for Operational Date
  const navigateDateDays = (days) => {
    const d = new Date(`${operationalDate}T12:00:00.000Z`);
    d.setDate(d.getDate() + days);
    setOperationalDate(d.toISOString().split('T')[0]);
  };

  const formatDateLabel = (d) => {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateString = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Preset Date Options
  const presets = [
    { label: '24 Jul (Today)', date: '2026-07-24' },
    { label: '26 Jul (Emirates A380)', date: '2026-07-26' },
    { label: '28 Jul (IndiGo C-Check)', date: '2026-07-28' },
    { label: '02 Aug (Singapore A350)', date: '2026-08-02' },
    { label: '10 Aug (United B787)', date: '2026-08-10' }
  ];

  return (
    <div className="dashboard-container">
      {/* Operational Date Selector Header Banner */}
      <div 
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sidebar-logo-icon" style={{ width: 40, height: 40 }}>
              <Calendar size={22} />
            </div>
            <div>
              <div className="detail-label" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                OPERATIONAL REFERENCE DATE SELECTOR
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-navy)' }}>
                Viewing Station Data For: {selectedDateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Interactive Date Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigateDateDays(-1)} title="Previous Day">
              <ChevronLeft size={16} />
            </button>
            
            <input
              type="date"
              className="form-input font-mono"
              style={{ width: '160px', fontWeight: 700, padding: '0.5rem 0.75rem', borderColor: 'var(--color-primary)' }}
              value={operationalDate}
              onChange={(e) => setOperationalDate(e.target.value)}
            />

            <button className="btn btn-secondary btn-sm" onClick={() => navigateDateDays(1)} title="Next Day">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick Date Presets Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-100)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
            Quick Select Date:
          </span>
          {presets.map(p => (
            <button
              key={p.date}
              className={`view-tab ${operationalDate === p.date ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setOperationalDate(p.date)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Total Hangars</span>
            <span className="metric-value">{TOTAL_HANGARS}</span>
          </div>
          <div className="metric-icon-box blue">
            <Building2 size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Available ({formatDateLabel(selectedDateObj)})</span>
            <span className="metric-value" style={{ color: 'var(--color-success)' }}>{availableCount}</span>
          </div>
          <div className="metric-icon-box green">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Occupied ({formatDateLabel(selectedDateObj)})</span>
            <span className="metric-value" style={{ color: 'var(--color-danger)' }}>{occupiedCount}</span>
          </div>
          <div className="metric-icon-box red">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Bookings on {formatDateLabel(selectedDateObj)}</span>
            <span className="metric-value">{activeBookingsForDate}</span>
          </div>
          <div className="metric-icon-box warning">
            <Clock size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Upcoming Flights</span>
            <span className="metric-value">{upcomingBookingsForDate}</span>
          </div>
          <div className="metric-icon-box blue">
            <CalendarDays size={24} />
          </div>
        </div>
      </div>

      {/* 12 Hangars Section */}
      <div className="section-header">
        <div className="section-title">
          <Building2 size={20} className="text-muted" />
          <span>Hangar Status Matrix — {formatDateLabel(selectedDateObj)} (12 Bays)</span>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onNavigateToNewBooking()}
        >
          <Plus size={16} />
          <span>New Booking</span>
        </button>
      </div>

      {/* 12 Status Cards Grid */}
      <div className="hangar-grid">
        {hangars.map((hangar) => {
          const { isOccupied, activeBooking } = hangar;

          return (
            <div key={hangar.id} className="hangar-card">
              <div className="hangar-card-header">
                <span className="hangar-title">
                  <Building2 size={18} style={{ color: '#38bdf8' }} />
                  <span>{hangar.name}</span>
                </span>
                <span className={`status-badge ${isOccupied ? 'occupied' : 'available'}`}>
                  {isOccupied ? 'Occupied' : 'Available'}
                </span>
              </div>

              <div className="hangar-card-body">
                {isOccupied && activeBooking ? (
                  <>
                    {/* Aircraft Photo Banner in Hangar Dock */}
                    <div className="hangar-aircraft-dock">
                      <img
                        src={activeBooking.imageUrl || (activeBooking.manufacturer === 'Airbus' ? './assets/airbus_a320.png' : './assets/boeing_787.png')}
                        alt={activeBooking.aircraftType}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
                        <span className="reg-tag" style={{ fontSize: '0.8rem', padding: '0.15rem 0.45rem', backgroundColor: 'rgba(255,255,255,0.95)', fontWeight: 800 }}>
                          {activeBooking.aircraftReg}
                        </span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 6, right: 6 }}>
                        <span className={`type-chip ${activeBooking.manufacturer.toLowerCase()}`} style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                          {activeBooking.manufacturer} {activeBooking.aircraftType}
                        </span>
                      </div>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Operator / Airline</span>
                      <span className="detail-value" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                        {activeBooking.operator}
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Flight Route</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>
                        {activeBooking.route || 'DEL ➔ HYD'} ({activeBooking.flightNo})
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Maintenance Scope</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>{activeBooking.maintenanceType}</span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Booked Until</span>
                      <span className="detail-value font-mono" style={{ fontWeight: 700, color: '#0369a1' }}>
                        {formatDateString(activeBooking.endDate)}
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Lead Engineer</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>{activeBooking.engineerName}</span>
                    </div>
                  </>
                ) : (
                  <div className="hangar-open-bay">
                    <Plane size={32} style={{ color: '#0284c7', opacity: 0.6, marginBottom: '0.35rem' }} />
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Open Hangar Bay Entry</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Unoccupied on {formatDateLabel(selectedDateObj)}</div>
                    {hangar.nextBooking && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.6rem', color: '#0369a1', fontWeight: 700, backgroundColor: '#e0f2fe', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                        Next Flight: {hangar.nextBooking.aircraftReg} ({formatDateString(hangar.nextBooking.startDate)})
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="hangar-card-footer">
                {isOccupied && activeBooking ? (
                  <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => onViewBookingDetail(activeBooking)}
                    >
                      <span>Details</span>
                      <ArrowRight size={14} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.4rem 0.65rem' }}
                      onClick={() => setCancelTarget(activeBooking)}
                      title="Cancel Hangar Reservation"
                    >
                      <Trash2 size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => onNavigateToNewBooking(hangar.name)}
                  >
                    <Plus size={14} />
                    <span>Book {hangar.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Reservation Confirmation Modal */}
      {cancelTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--color-danger)', fontSize: '1.1rem' }}>
                Cancel Hangar Reservation?
              </h3>
              <button className="close-btn" onClick={() => setCancelTarget(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: 'var(--color-slate-700)', fontSize: '0.925rem' }}>
                Are you sure you want to cancel the reservation for <strong>{cancelTarget.aircraftReg}</strong> ({cancelTarget.operator}) in <strong>{cancelTarget.hangarId}</strong>?
              </p>
              <div style={{ backgroundColor: 'var(--color-slate-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div><strong>Work Order ID:</strong> {cancelTarget.id}</div>
                <div><strong>Maintenance:</strong> {cancelTarget.maintenanceType}</div>
                <div><strong>Scheduled Window:</strong> {formatDateString(cancelTarget.startDate)} ➔ {formatDateString(cancelTarget.endDate)}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setCancelTarget(null)}>
                Keep Reservation
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmCancelReservation}>
                Confirm & Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
