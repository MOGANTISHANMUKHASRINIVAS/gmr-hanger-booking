import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plane, 
  User, 
  Wrench, 
  Plus,
  Filter,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trash2
} from 'lucide-react';
import { getHangarStatuses, deleteBooking } from '../services/bookingService';

const HangarStatus = ({ onNavigateToNewBooking, onViewBookingDetail, showToast, triggerRefresh }) => {
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, OCCUPIED
  const [operationalDate, setOperationalDate] = useState('2026-07-24');
  const [cancelTarget, setCancelTarget] = useState(null);

  const hangars = getHangarStatuses(`${operationalDate}T12:00:00.000Z`);
  const selectedDateObj = new Date(`${operationalDate}T12:00:00.000Z`);

  const filteredHangars = hangars.filter(h => {
    if (statusFilter === 'AVAILABLE') return !h.isOccupied;
    if (statusFilter === 'OCCUPIED') return h.isOccupied;
    return true;
  });

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

  const navigateDateDays = (days) => {
    const d = new Date(`${operationalDate}T12:00:00.000Z`);
    d.setDate(d.getDate() + days);
    setOperationalDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="hangar-status-container">
      {/* Date Selector Header Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar-logo-icon" style={{ width: 36, height: 36 }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="detail-label" style={{ fontSize: '0.725rem' }}>Hangar Bay Operational Date</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)' }}>
              Selected Date: {selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateDateDays(-1)}>
            <ChevronLeft size={16} />
          </button>
          
          <input
            type="date"
            className="form-input font-mono"
            style={{ width: '150px', fontWeight: 600, padding: '0.4rem 0.65rem' }}
            value={operationalDate}
            onChange={(e) => setOperationalDate(e.target.value)}
          />

          <button className="btn btn-secondary btn-sm" onClick={() => navigateDateDays(1)}>
            <ChevronRight size={16} />
          </button>

          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setOperationalDate('2026-07-24')}
            style={{ marginLeft: '0.25rem' }}
          >
            Today (24 Jul)
          </button>
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Building2 size={22} className="text-muted" />
            <span>MRO Hangar Status — {selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </h2>
        </div>

        <div className="filters-group">
          <Filter size={16} className="text-muted" />
          <div className="view-mode-tabs">
            <button 
              className={`view-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All (12)
            </button>
            <button 
              className={`view-tab ${statusFilter === 'AVAILABLE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('AVAILABLE')}
            >
              Available ({hangars.filter(h => !h.isOccupied).length})
            </button>
            <button 
              className={`view-tab ${statusFilter === 'OCCUPIED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OCCUPIED')}
            >
              Occupied ({hangars.filter(h => h.isOccupied).length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 12 Hangar Cards */}
      <div className="hangar-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {filteredHangars.map((hangar) => {
          const { isOccupied, activeBooking } = hangar;

          return (
            <div 
              key={hangar.id} 
              className="hangar-card"
            >
              <div className="hangar-card-header">
                <span className="hangar-title" style={{ fontSize: '1.1rem' }}>
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
                      <span className="detail-value" style={{ fontWeight: 700 }}>{activeBooking.operator}</span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Flight Route</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <MapPin size={13} className="text-muted" />
                        <span>{activeBooking.route || 'DEL ➔ HYD'} ({activeBooking.flightNo})</span>
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Maintenance Scope</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Wrench size={13} className="text-muted" />
                        <span>{activeBooking.maintenanceType}</span>
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Booking End Date</span>
                      <span className="detail-value font-mono" style={{ color: '#0369a1', fontWeight: 700 }}>
                        {formatDate(activeBooking.endDate)}
                      </span>
                    </div>

                    <div className="card-detail-row">
                      <span className="detail-label">Lead Engineer</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <User size={13} className="text-muted" />
                        <span>{activeBooking.engineerName}</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="hangar-open-bay">
                    <CheckCircle2 size={32} style={{ color: '#059669', marginBottom: '0.35rem' }} />
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      Bay Unoccupied on {selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Slot ready for instant aircraft maintenance.
                    </p>
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
                      <Eye size={14} />
                      <span>Details</span>
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
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => onNavigateToNewBooking(hangar.name)}
                  >
                    <Plus size={14} />
                    <span>Reserve {hangar.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Reservation Modal */}
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
                <div><strong>Scheduled Window:</strong> {formatDate(cancelTarget.startDate)} ➔ {formatDate(cancelTarget.endDate)}</div>
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

export default HangarStatus;
