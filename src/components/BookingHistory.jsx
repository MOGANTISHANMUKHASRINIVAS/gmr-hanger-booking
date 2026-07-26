import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowUpDown,
  Building2,
  Plane,
  Wrench,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  getBookings, 
  deleteBooking, 
  updateBooking, 
  HANGAR_LIST, 
  MAINTENANCE_TYPES, 
  AIRCRAFT_DATA 
} from '../services/bookingService';

const BookingHistory = ({ onViewDetail, showToast, refreshTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hangarFilter, setHangarFilter] = useState('ALL');
  const [mfrFilter, setMfrFilter] = useState('ALL');
  const [sortField, setSortField] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Edit modal state
  const [editingBooking, setEditingBooking] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  const bookings = getBookings();

  // Filter & Search Logic
  const filteredBookings = bookings.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      b.aircraftReg.toLowerCase().includes(searchLower) ||
      b.operator.toLowerCase().includes(searchLower) ||
      b.manufacturer.toLowerCase().includes(searchLower) ||
      b.aircraftType.toLowerCase().includes(searchLower) ||
      b.hangarId.toLowerCase().includes(searchLower) ||
      b.maintenanceType.toLowerCase().includes(searchLower) ||
      b.engineerName.toLowerCase().includes(searchLower) ||
      b.startDate.includes(searchTerm) ||
      b.endDate.includes(searchTerm)
    );

    const matchesHangar = hangarFilter === 'ALL' || b.hangarId === hangarFilter;
    const matchesMfr = mfrFilter === 'ALL' || b.manufacturer === mfrFilter;

    return matchesSearch && matchesHangar && matchesMfr;
  });

  // Sorting Logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'startDate' || sortField === 'endDate') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Delete handler
  const confirmDelete = () => {
    if (!deletingBookingId) return;
    try {
      deleteBooking(deletingBookingId);
      showToast('Booking deleted successfully.', 'success');
      setDeletingBookingId(null);
    } catch (e) {
      showToast('Failed to delete booking.', 'error');
    }
  };

  // Edit save handler
  const handleSaveEdit = (e) => {
    e.preventDefault();
    try {
      updateBooking(editingBooking.id, editingBooking);
      showToast('Booking updated successfully.', 'success');
      setEditingBooking(null);
    } catch (err) {
      showToast(err.message || 'Failed to update booking.', 'error');
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Booking ID', 'Aircraft Reg', 'Operator', 'Manufacturer', 'Type', 'Hangar', 'Maintenance Type', 'Engineer', 'Start Date', 'End Date', 'Remarks'];
    const rows = sortedBookings.map(b => [
      b.id,
      b.aircraftReg,
      b.operator,
      b.manufacturer,
      b.aircraftType,
      b.hangarId,
      b.maintenanceType,
      b.engineerName,
      b.startDate,
      b.endDate,
      `"${(b.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GMR_Hangar_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported booking logs to CSV.', 'success');
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
    <div className="history-container">
      {/* Table Toolbar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search reg, operator, type, engineer, dates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="close-btn" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filters-group">
            <select
              value={hangarFilter}
              onChange={(e) => setHangarFilter(e.target.value)}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="ALL">All Hangars</option>
              {HANGAR_LIST.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <select
              value={mfrFilter}
              onChange={(e) => setMfrFilter(e.target.value)}
              className="form-select"
              style={{ width: '140px' }}
            >
              <option value="ALL">All Mfrs</option>
              <option value="Airbus">Airbus</option>
              <option value="Boeing">Boeing</option>
            </select>

            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('aircraftReg')} style={{ cursor: 'pointer' }}>
                Aircraft Reg <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('operator')} style={{ cursor: 'pointer' }}>
                Operator / Airline <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('manufacturer')} style={{ cursor: 'pointer' }}>
                Model <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('hangarId')} style={{ cursor: 'pointer' }}>
                Hangar <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('maintenanceType')} style={{ cursor: 'pointer' }}>
                Maintenance Scope <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>
                Schedule Window <ArrowUpDown size={12} />
              </th>
              <th>Engineer</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-500)' }}>
                  No booking records match your search query.
                </td>
              </tr>
            ) : (
              sortedBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="reg-tag">{b.aircraftReg}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                    {b.operator}
                  </td>
                  <td>
                    <span className={`type-chip ${b.manufacturer.toLowerCase()}`}>
                      {b.manufacturer} {b.aircraftType}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {b.hangarId}
                    </span>
                  </td>
                  <td>{b.maintenanceType}</td>
                  <td className="font-mono text-sm">
                    {formatDate(b.startDate)} → <br />
                    {formatDate(b.endDate)}
                  </td>
                  <td>{b.engineerName}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewDetail(b)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingBooking(b)}
                        title="Edit Booking"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => setDeletingBookingId(b.id)}
                        title="Delete Booking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Booking ({editingBooking.id})</h3>
              <button className="close-btn" onClick={() => setEditingBooking(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Aircraft Reg</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={editingBooking.aircraftReg}
                    onChange={(e) => setEditingBooking({ ...editingBooking, aircraftReg: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operator / Airline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingBooking.operator}
                    onChange={(e) => setEditingBooking({ ...editingBooking, operator: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hangar Slot</label>
                  <select
                    className="form-select"
                    value={editingBooking.hangarId}
                    onChange={(e) => setEditingBooking({ ...editingBooking, hangarId: e.target.value })}
                  >
                    {HANGAR_LIST.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance Type</label>
                  <select
                    className="form-select"
                    value={editingBooking.maintenanceType}
                    onChange={(e) => setEditingBooking({ ...editingBooking, maintenanceType: e.target.value })}
                  >
                    {MAINTENANCE_TYPES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Engineer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingBooking.engineerName}
                    onChange={(e) => setEditingBooking({ ...editingBooking, engineerName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date/Time (ISO)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={editingBooking.startDate.slice(0, 16)}
                    onChange={(e) => setEditingBooking({ ...editingBooking, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date/Time (ISO)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={editingBooking.endDate.slice(0, 16)}
                    onChange={(e) => setEditingBooking({ ...editingBooking, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-textarea"
                    value={editingBooking.remarks || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBookingId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--color-danger)' }}>Confirm Deletion</h3>
              <button className="close-btn" onClick={() => setDeletingBookingId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem' }}>
                Are you sure you want to delete booking <strong>{deletingBookingId}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingBookingId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
