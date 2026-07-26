import React from 'react';
import { 
  Plane, 
  Building, 
  Wrench, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  X,
  Building2,
  MapPin,
  ShieldCheck,
  Trash2
} from 'lucide-react';

const BookingDetailModal = ({ booking, onClose, onEdit, onDelete }) => {
  if (!booking) return null;

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="reg-tag">{booking.aircraftReg}</span>
            <span className="modal-title" style={{ fontSize: '1.1rem' }}>
              Work Order Specification #{booking.id}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Aircraft Image Hero Banner */}
        <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
          <img
            src={booking.imageUrl || (booking.manufacturer === 'Airbus' ? './assets/airbus_a320.png' : './assets/boeing_787.png')}
            alt={booking.aircraftType}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="reg-tag" style={{ fontSize: '1rem', backgroundColor: 'rgba(255,255,255,0.95)' }}>
              {booking.aircraftReg}
            </span>
            <span className={`type-chip ${booking.manufacturer.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>
              {booking.manufacturer} {booking.aircraftType}
            </span>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 16 }}>
            <span className="status-badge available" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <ShieldCheck size={14} /> {booking.status || 'Docked in Hangar'}
            </span>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span className="detail-label">Assigned Hangar Bay</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                {booking.hangarId}
              </div>
            </div>

            <div>
              <span className="detail-label">Flight Details</span>
              <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
                Flight: {booking.flightNo || '6E-2041'} ({booking.route || 'DEL ➔ HYD'})
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card-detail-row">
              <span className="detail-label">Operator / Airline</span>
              <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                {booking.operator}
              </span>
            </div>

            <div className="card-detail-row">
              <span className="detail-label">Maintenance Scope</span>
              <span className="detail-value">{booking.maintenanceType}</span>
            </div>

            <div className="card-detail-row">
              <span className="detail-label">Lead Engineer In Charge</span>
              <span className="detail-value">{booking.engineerName}</span>
            </div>

            <div className="card-detail-row">
              <span className="detail-label">System Record Date</span>
              <span className="detail-value text-sm font-mono">{formatDate(booking.createdAt)}</span>
            </div>

            <div className="card-detail-row" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label">Scheduled Stay Interval</span>
              <div className="font-mono" style={{ backgroundColor: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', fontWeight: 600 }}>
                {formatDate(booking.startDate)} ➔ {formatDate(booking.endDate)}
              </div>
            </div>

            {booking.remarks && (
              <div className="card-detail-row" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Work Scope & Special Instructions</span>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                  {booking.remarks}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {onDelete && (
              <button className="btn btn-danger btn-sm" onClick={() => { onDelete(booking.id); onClose(); }}>
                <Trash2 size={14} />
                <span>Cancel Reservation / Delete</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onEdit && (
              <button className="btn btn-secondary btn-sm" onClick={() => { onEdit(booking); onClose(); }}>
                Edit Booking
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
