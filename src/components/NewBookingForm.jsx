import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Plane, 
  Wrench, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  Building,
  RotateCcw,
  Check
} from 'lucide-react';
import { 
  AIRCRAFT_DATA, 
  HANGAR_LIST, 
  MAINTENANCE_TYPES, 
  checkSlotAvailability, 
  saveBooking,
  getAircraftImageUrl
} from '../services/bookingService';

const NewBookingForm = ({ preselectedHangar, onBookingCreated, showToast }) => {
  const getDefaultStartDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  };

  const initialFormState = {
    aircraftReg: '',
    operator: '',
    manufacturer: 'Airbus',
    aircraftType: 'A320neo',
    hangarId: preselectedHangar || 'Hangar 1',
    maintenanceType: 'C Check',
    engineerName: '',
    remarks: '',
    startDate: getDefaultStartDate(),
    startTime: '08:00',
    endDate: getDefaultEndDate(),
    endTime: '18:00'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableTypes, setAvailableTypes] = useState(AIRCRAFT_DATA.Airbus);
  const [validationResult, setValidationResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPreviewImage = getAircraftImageUrl(formData.manufacturer, formData.aircraftType);

  // Dynamic aircraft type update based on Manufacturer selection
  useEffect(() => {
    const types = AIRCRAFT_DATA[formData.manufacturer] || [];
    setAvailableTypes(types);
    if (!types.includes(formData.aircraftType)) {
      setFormData(prev => ({ ...prev, aircraftType: types[0] || '' }));
    }
  }, [formData.manufacturer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationResult(null); // reset validation when fields change
  };

  // Perform availability check
  const handleCheckAvailability = () => {
    const startISO = `${formData.startDate}T${formData.startTime}`;
    const endISO = `${formData.endDate}T${formData.endTime}`;

    const result = checkSlotAvailability(formData.hangarId, startISO, endISO);
    setValidationResult(result);
    return result;
  };

  // Handle Form Submission (opens confirmation dialog)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.aircraftReg || !formData.operator || !formData.engineerName) {
      showToast('Please complete all required fields.', 'warning');
      return;
    }

    const check = handleCheckAvailability();
    if (!check.isAvailable) {
      showToast(check.message, 'error');
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirm and save booking to MongoDB
  const confirmAndSaveBooking = async () => {
    setIsSubmitting(true);
    try {
      const startISO = `${formData.startDate}T${formData.startTime}`;
      const endISO = `${formData.endDate}T${formData.endTime}`;

      const payload = {
        aircraftReg: formData.aircraftReg.toUpperCase().trim(),
        operator: formData.operator.trim(),
        manufacturer: formData.manufacturer,
        aircraftType: formData.aircraftType,
        hangarId: formData.hangarId,
        maintenanceType: formData.maintenanceType,
        engineerName: formData.engineerName.trim(),
        remarks: formData.remarks.trim(),
        startDate: startISO,
        endDate: endISO
      };

      const created = await saveBooking(payload);
      showToast(`Hangar slot booked successfully! ID: ${created.id}`, 'success');
      setShowConfirmModal(false);
      handleReset();
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      showToast(err.message || 'Failed to create booking.', 'error');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setValidationResult(null);
  };

  return (
    <div className="form-container">
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', fontSize: '1.3rem' }}>
          Schedule Hangar Slot
        </h2>
        <p className="text-muted text-sm">
          Enter aircraft registration, operator details, work order scope, and scheduled stay duration.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Aircraft Registration */}
          <div className="form-group">
            <label className="form-label">
              <Plane size={15} />
              <span>Aircraft Registration *</span>
            </label>
            <input
              type="text"
              name="aircraftReg"
              placeholder="e.g. VT-ABC or A6-EUA"
              value={formData.aircraftReg}
              onChange={handleChange}
              className="form-input font-mono"
              required
            />
          </div>

          {/* Operator / Airline */}
          <div className="form-group">
            <label className="form-label">
              <Building size={15} />
              <span>Operator / Airline *</span>
            </label>
            <input
              type="text"
              name="operator"
              placeholder="e.g. IndiGo, Air India, Emirates"
              value={formData.operator}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Manufacturer */}
          <div className="form-group">
            <label className="form-label">
              <span>Manufacturer *</span>
            </label>
            <select
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Airbus">Airbus</option>
              <option value="Boeing">Boeing</option>
            </select>
          </div>

          {/* Dynamic Aircraft Type & Photo Preview */}
          <div className="form-group">
            <label className="form-label">
              <span>Aircraft Type *</span>
            </label>
            <select
              name="aircraftType"
              value={formData.aircraftType}
              onChange={handleChange}
              className="form-select"
            >
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div style={{ marginTop: '0.5rem', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-slate-200)', position: 'relative' }}>
              <img
                src={currentPreviewImage}
                alt="Aircraft Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 4, left: 6, backgroundColor: 'rgba(15,23,42,0.75)', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                Real Aircraft Photo Preview: {formData.manufacturer} {formData.aircraftType}
              </div>
            </div>
          </div>

          {/* Hangar Dropdown */}
          <div className="form-group">
            <label className="form-label">
              <Building size={15} />
              <span>Hangar Slot *</span>
            </label>
            <select
              name="hangarId"
              value={formData.hangarId}
              onChange={handleChange}
              className="form-select"
            >
              {HANGAR_LIST.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Maintenance Type */}
          <div className="form-group">
            <label className="form-label">
              <Wrench size={15} />
              <span>Maintenance Type *</span>
            </label>
            <select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              className="form-select"
            >
              {MAINTENANCE_TYPES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Engineer Name */}
          <div className="form-group">
            <label className="form-label">
              <User size={15} />
              <span>Lead Engineer Name *</span>
            </label>
            <input
              type="text"
              name="engineerName"
              placeholder="e.g. Eng. Rajesh Kumar"
              value={formData.engineerName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Start Date & Start Time */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={15} />
              <span>Start Date & Time *</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="form-input"
                style={{ width: '130px' }}
                required
              />
            </div>
          </div>

          {/* End Date & End Time */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={15} />
              <span>End Date & Time *</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="form-input"
                style={{ width: '130px' }}
                required
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="form-group full-width">
            <label className="form-label">
              <FileText size={15} />
              <span>Work Scope Remarks / Special Instructions</span>
            </label>
            <textarea
              name="remarks"
              placeholder="Enter work order notes, specialized tooling requirements, or ground power needs..."
              value={formData.remarks}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Validation Status Banner */}
        {validationResult && (
          <div className={`validation-banner ${validationResult.isAvailable ? 'success' : 'error'}`}>
            {validationResult.isAvailable ? (
              <>
                <CheckCircle2 size={20} />
                <span>Hangar available.</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                <span>Selected hangar is already occupied during this period.</span>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCheckAvailability}
          >
            <Check size={16} />
            <span>Check Availability</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={validationResult && !validationResult.isAvailable}
          >
            <Plane size={16} />
            <span>Book Hangar</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Hangar Booking</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-slate-700)' }}>
                Please review the work order booking details before reserving the bay in MongoDB:
              </p>

              <div style={{ backgroundColor: 'var(--color-slate-100)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span className="detail-label">Aircraft Reg:</span>
                  <div className="font-mono" style={{ fontWeight: 700 }}>{formData.aircraftReg.toUpperCase()}</div>
                </div>
                <div>
                  <span className="detail-label">Operator:</span>
                  <div style={{ fontWeight: 600 }}>{formData.operator}</div>
                </div>
                <div>
                  <span className="detail-label">Model:</span>
                  <div>{formData.manufacturer} {formData.aircraftType}</div>
                </div>
                <div>
                  <span className="detail-label">Hangar Slot:</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{formData.hangarId}</div>
                </div>
                <div>
                  <span className="detail-label">Maintenance:</span>
                  <div>{formData.maintenanceType}</div>
                </div>
                <div>
                  <span className="detail-label">Lead Engineer:</span>
                  <div>{formData.engineerName}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Schedule Interval:</span>
                  <div className="font-mono text-sm" style={{ fontWeight: 600 }}>
                    {formData.startDate} {formData.startTime} → {formData.endDate} {formData.endTime}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmAndSaveBooking} disabled={isSubmitting}>
                {isSubmitting ? 'Saving to MongoDB...' : 'Confirm & Save to MongoDB'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBookingForm;
