import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plane, 
  Clock, 
  Eye, 
  Building2,
  MapPin,
  CheckCircle2,
  Wrench,
  User,
  ArrowRight,
  BarChart3,
  Grid,
  Download,
  Upload
} from 'lucide-react';
import { getBookings, HANGAR_LIST } from '../services/bookingService';
import CsvUploadModal from './CsvUploadModal';

// Gantt Bar Chart Matrix Component (Month & Week Continuous Bar Graph)
const GanttChartMatrix = ({ daysList, hangarList, bookings, onViewDetail, isMonthView }) => {
  const totalCols = daysList.length;
  const rangeStartISO = daysList[0].iso;
  const rangeEndISO = daysList[totalCols - 1].iso;
  const trackMinWidth = isMonthView ? '1280px' : '850px';

  const formatDateShort = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('T')[0].split('-');
    if (parts.length < 3) return isoStr;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]}`;
  };

  const getTimeOnly = (isoStr) => {
    if (!isoStr || !isoStr.includes('T')) return '08:00';
    return isoStr.split('T')[1].substring(0, 5);
  };

  const getFractionalDayOffset = (isoStr, defaultIdx) => {
    if (!isoStr) return defaultIdx;
    const dateOnly = isoStr.split('T')[0];
    let idx = daysList.findIndex(d => d.iso === dateOnly);
    if (idx < 0) return defaultIdx;

    let hour = 12;
    let minute = 0;
    if (isoStr.includes('T')) {
      const timeParts = isoStr.split('T')[1].split(':');
      if (timeParts.length >= 2) {
        hour = parseInt(timeParts[0], 10) || 0;
        minute = parseInt(timeParts[1], 10) || 0;
      }
    }
    return idx + (hour + minute / 60.0) / 24.0;
  };

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-label-col" style={{ color: '#ffffff', backgroundColor: '#081b33', fontWeight: 800, fontSize: '0.85rem' }}>Hangar Bay</div>
        <div className="gantt-timeline-header" style={{ minWidth: trackMinWidth }}>
          {daysList.map(d => (
            <div key={d.iso} className="gantt-header-cell">
              <div style={{ fontWeight: 700 }}>{d.dayLabel || d.label}</div>
              <div className="font-mono text-sm" style={{ opacity: 0.8, fontSize: '0.675rem' }}>{d.dateSub || ''}</div>
            </div>
          ))}
        </div>
      </div>

      {hangarList.map(hName => {
        const rowBookings = bookings.filter(b => {
          if (b.hangarId !== hName) return false;
          const bStart = b.startDate.split('T')[0];
          const bEnd = b.endDate.split('T')[0];
          return bStart <= rangeEndISO && bEnd >= rangeStartISO;
        });

        return (
          <div key={hName} className="gantt-row">
            <div className="gantt-row-label" style={{ color: '#ffffff', backgroundColor: '#081b33', fontWeight: 800, fontSize: '0.85rem' }}>{hName}</div>
            <div className="gantt-track" style={{ minWidth: trackMinWidth }}>
              <div className="gantt-bg-grid">
                {daysList.map(d => (
                  <div key={d.iso} className="gantt-bg-cell"></div>
                ))}
              </div>

              {rowBookings.map(b => {
                const bStartDay = b.startDate.split('T')[0];
                const bEndDay = b.endDate.split('T')[0];

                let rawStartIdx = daysList.findIndex(d => d.iso === bStartDay);
                let rawEndIdx = daysList.findIndex(d => d.iso === bEndDay);

                let startOffset = getFractionalDayOffset(b.startDate, rawStartIdx < 0 ? 0 : rawStartIdx);
                let endOffset = getFractionalDayOffset(b.endDate, rawEndIdx < 0 ? totalCols : rawEndIdx + 1);

                if (rawStartIdx < 0) startOffset = 0;
                if (rawEndIdx < 0) endOffset = totalCols;

                const durationInDays = Math.max(0.1, endOffset - startOffset);
                const leftPct = Math.max(0, (startOffset / totalCols) * 100);
                const widthPct = Math.min(100 - leftPct, (durationInDays / totalCols) * 100);

                const isAirbus = b.manufacturer === 'Airbus';
                const startTimeStr = getTimeOnly(b.startDate);
                const endTimeStr = getTimeOnly(b.endDate);

                return (
                  <div
                    key={b.id}
                    className="gantt-bar"
                    style={{
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${Math.max(3.5, widthPct)}% - 4px)`,
                      background: isAirbus ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'linear-gradient(135deg, #4f46e5, #3730a3)'
                    }}
                    onClick={() => onViewDetail(b)}
                    title={`${b.aircraftReg} (${b.operator}) Flight ${b.flightNo || ''}\nScope: ${b.maintenanceType}\nStay: ${b.startDate.replace('T', ' ')} to ${b.endDate.replace('T', ' ')}\nTap to open full flight specs`}
                  >
                    <div className="gantt-text">
                      <div className="gantt-reg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span>{b.aircraftReg} • {b.operator} ({b.flightNo || 'FL-100'})</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 700 }}>{startTimeStr} ➔ {endTimeStr}</span>
                      </div>
                      <div className="gantt-sub">
                        {b.maintenanceType} | {formatDateShort(b.startDate)} ({startTimeStr}) ➔ {formatDateShort(b.endDate)} ({endTimeStr})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Day Hourly 24-Hour Bar Graph Matrix Component (00:00 to 24:00 Time Slots)
const DayHourlyGanttMatrix = ({ dateStr, hangarList, bookings, onViewDetail }) => {
  const hoursList = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0');
    return `${h}:00`;
  });

  const selectedDateObj = new Date(`${dateStr}T00:00:00`);
  const selectedDateEndObj = new Date(`${dateStr}T23:59:59`);

  const getTimeOnly = (isoStr) => {
    if (!isoStr || !isoStr.includes('T')) return '08:00';
    return isoStr.split('T')[1].substring(0, 5);
  };

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-label-col" style={{ color: '#ffffff', backgroundColor: '#081b33', fontWeight: 800, fontSize: '0.85rem' }}>Hangar Bay</div>
        <div className="gantt-timeline-header" style={{ minWidth: '1150px' }}>
          {hoursList.map(h => (
            <div key={h} className="gantt-header-cell" style={{ flex: 1, minWidth: '42px', boxSizing: 'border-box' }}>
              <div style={{ fontWeight: 700, fontSize: '0.725rem' }}>{h}</div>
            </div>
          ))}
        </div>
      </div>

      {hangarList.map(hName => {
        const rowBookings = bookings.filter(b => {
          if (b.hangarId !== hName) return false;
          const bStart = new Date(b.startDate);
          const bEnd = new Date(b.endDate);
          return bStart <= selectedDateEndObj && bEnd >= selectedDateObj;
        });

        return (
          <div key={hName} className="gantt-row">
            <div className="gantt-row-label" style={{ color: '#ffffff', backgroundColor: '#081b33', fontWeight: 800, fontSize: '0.85rem' }}>{hName}</div>
            <div className="gantt-track" style={{ minWidth: '1150px' }}>
              <div className="gantt-bg-grid">
                {hoursList.map(h => (
                  <div key={h} className="gantt-bg-cell"></div>
                ))}
              </div>

              {rowBookings.map(b => {
                const bStart = new Date(b.startDate);
                const bEnd = new Date(b.endDate);

                let startHour = 0;
                if (bStart > selectedDateObj) {
                  startHour = bStart.getHours() + bStart.getMinutes() / 60.0;
                }

                let endHour = 24;
                if (bEnd < selectedDateEndObj) {
                  endHour = bEnd.getHours() + bEnd.getMinutes() / 60.0;
                }

                const durationHours = Math.max(0.25, endHour - startHour);
                const leftPct = (startHour / 24.0) * 100;
                const widthPct = (durationHours / 24.0) * 100;

                const isAirbus = b.manufacturer === 'Airbus';
                const startTimeStr = getTimeOnly(b.startDate);
                const endTimeStr = getTimeOnly(b.endDate);

                return (
                  <div
                    key={b.id}
                    className="gantt-bar"
                    style={{
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${Math.max(4, widthPct)}% - 4px)`,
                      background: isAirbus ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'linear-gradient(135deg, #4f46e5, #3730a3)'
                    }}
                    onClick={() => onViewDetail(b)}
                    title={`${b.aircraftReg} (${b.operator}) Flight ${b.flightNo || ''}\nScope: ${b.maintenanceType}\nSlot: ${startTimeStr} to ${endTimeStr}\nTap to open full flight specs`}
                  >
                    <div className="gantt-text">
                      <div className="gantt-reg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span>{b.aircraftReg} • {b.operator} ({b.flightNo || 'FL-100'})</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 700 }}>{startTimeStr} ➔ {endTimeStr}</span>
                      </div>
                      <div className="gantt-sub">
                        {b.maintenanceType} | Time Slot: {startTimeStr} ➔ {endTimeStr} ({b.hangarId})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CalendarView = ({ onViewBookingDetail, showToast, refreshTrigger }) => {
  const [viewMode, setViewMode] = useState('month-gantt'); 
  const [selectedMonth, setSelectedMonth] = useState(6); 
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDayDate, setSelectedDayDate] = useState('2026-07-24');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const bookings = getBookings();

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const yearsList = [2026, 2027];

  // Update Month & Year state and sync selectedDayDate accordingly
  const updateMonthYear = (newMonth, newYear) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);

    // Get current day number from selectedDayDate
    let currentDay = 1;
    if (selectedDayDate) {
      const parts = selectedDayDate.split('-');
      if (parts.length === 3) {
        currentDay = parseInt(parts[2], 10) || 1;
      }
    }

    const maxDaysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const safeDay = Math.min(Math.max(1, currentDay), maxDaysInNewMonth);
    const newIsoDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
    setSelectedDayDate(newIsoDate);
  };

  const handlePrevMonth = () => {
    let newM = selectedMonth - 1;
    let newY = selectedYear;
    if (newM < 0) {
      newM = 11;
      newY = selectedYear - 1;
    }
    updateMonthYear(newM, newY);
  };

  const handleNextMonth = () => {
    let newM = selectedMonth + 1;
    let newY = selectedYear;
    if (newM > 11) {
      newM = 0;
      newY = selectedYear + 1;
    }
    updateMonthYear(newM, newY);
  };

  // Sync Month/Year when Date picker or Day input changes
  const handleDayDateChange = (newDateStr) => {
    if (!newDateStr) return;
    setSelectedDayDate(newDateStr);
    const parts = newDateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        setSelectedYear(y);
        setSelectedMonth(m);
      }
    }
  };

  // Week navigation controls (Prev Week < / Next Week >)
  const handlePrevWeek = () => {
    const d = new Date(`${selectedDayDate}T12:00:00.000Z`);
    d.setDate(d.getDate() - 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    handleDayDateChange(iso);
  };

  const handleNextWeek = () => {
    const d = new Date(`${selectedDayDate}T12:00:00.000Z`);
    d.setDate(d.getDate() + 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    handleDayDateChange(iso);
  };

  // CSV Export Handler for Calendar Schedule
  const handleExportCalendarCSV = () => {
    const selectedMonthName = monthsList[selectedMonth];
    
    // Filter bookings active during selected Month/Year
    const monthBookings = bookings.filter(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      const startMonth = bStart.getMonth();
      const startYear = bStart.getFullYear();
      const endMonth = bEnd.getMonth();
      const endYear = bEnd.getFullYear();

      return (
        (startYear === selectedYear && startMonth === selectedMonth) ||
        (endYear === selectedYear && endMonth === selectedMonth)
      );
    });

    const exportList = monthBookings.length > 0 ? monthBookings : bookings;

    const headers = [
      'Booking ID',
      'Aircraft Reg',
      'Flight No',
      'Route',
      'Operator',
      'Manufacturer',
      'Aircraft Type',
      'Hangar Bay',
      'Maintenance Scope',
      'Lead Engineer',
      'Start Date & Time',
      'End Date & Time',
      'Status',
      'Remarks'
    ];

    const rows = exportList.map(b => [
      b.id,
      b.aircraftReg,
      b.flightNo || 'N/A',
      `"${b.route || 'ORIGIN ➔ HYD'}"`,
      `"${b.operator}"`,
      b.manufacturer,
      b.aircraftType,
      b.hangarId,
      `"${b.maintenanceType}"`,
      `"${b.engineerName}"`,
      b.startDate.replace('T', ' '),
      b.endDate.replace('T', ' '),
      `"${b.status || 'Scheduled'}"`,
      `"${(b.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GMR_Hangar_Schedule_${selectedMonthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthDaysList = (monthIdx, yearNum) => {
    const totalDays = new Date(yearNum, monthIdx + 1, 0).getDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dates = [];
    for (let i = 1; i <= totalDays; i++) {
      const iso = `${yearNum}-${String(monthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dObj = new Date(yearNum, monthIdx, i);
      const dayName = dObj.toLocaleDateString('en-GB', { weekday: 'short' });
      dates.push({
        iso,
        label: `${i}`,
        dayLabel: `${i} ${months[monthIdx]}`,
        dateSub: dayName
      });
    }
    return dates;
  };

  // Generate Week Days List for Gantt Bar Chart (7 full days: Monday through Sunday)
  const getWeekDaysList = (refDateStr) => {
    const parts = refDateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    
    // Create local Date object
    const refDate = new Date(y, m, d);
    const dayOfWeek = refDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    
    // Start week on Monday -> Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDate = new Date(y, m, d + mondayOffset);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const curr = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      const iso = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
      dates.push({
        iso,
        label: curr.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' }),
        dayLabel: curr.toLocaleDateString('en-GB', { weekday: 'short' }),
        dateSub: curr.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      });
    }
    return dates;
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayOfWeek = date.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr: dayDateStr
      });
    }
    return days;
  };

  const daysGrid = getDaysInMonth(selectedMonth, selectedYear);
  const monthDaysList = getMonthDaysList(selectedMonth, selectedYear);
  const weekDaysList = getWeekDaysList(selectedDayDate);

  const getBookingsForDay = (dateStr) => {
    if (!dateStr) return [];
    return bookings.filter(b => {
      const bStart = b.startDate.split('T')[0];
      const bEnd = b.endDate.split('T')[0];
      return dateStr >= bStart && dateStr <= bEnd;
    });
  };

  const activeDayBookings = getBookingsForDay(selectedDayDate);

  return (
    <div className="calendar-container">
      <div className="calendar-view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <select className="form-select" style={{ width: '130px', fontWeight: 700 }} value={selectedMonth} onChange={(e) => updateMonthYear(Number(e.target.value), selectedYear)}>
              {monthsList.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
            <select className="form-select" style={{ width: '90px', fontWeight: 700 }} value={selectedYear} onChange={(e) => updateMonthYear(selectedMonth, Number(e.target.value))}>
              {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => updateMonthYear(6, 2026)}>
            Today (24 Jul 2026)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="view-mode-tabs">
            <button className={`view-tab ${viewMode === 'month-gantt' ? 'active' : ''}`} onClick={() => setViewMode('month-gantt')} title="Full Month Bar Graph (1-31 dates)">
              📊 Month Bar Chart (1-31)
            </button>
            <button className={`view-tab ${viewMode === 'week-gantt' ? 'active' : ''}`} onClick={() => setViewMode('week-gantt')} title="Continuous Week Bar Graph">
              🗓️ Week Bar Chart (7 Days)
            </button>
            <button className={`view-tab ${viewMode === 'day-gantt' ? 'active' : ''}`} onClick={() => setViewMode('day-gantt')} title="24-Hour Time Slot Bar Graph (00:00 - 24:00)">
              ⏱️ Day Bar Chart (00:00 - 24:00)
            </button>
            <button className={`view-tab ${viewMode === 'month-grid' ? 'active' : ''}`} onClick={() => setViewMode('month-grid')} title="Classic Month Calendar Grid">
              📋 Month Grid
            </button>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => setIsUploadModalOpen(true)}
            title="Upload CSV Schedule to visualize in Bar Graphs"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Upload size={15} />
            <span>Upload CSV</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleExportCalendarCSV}
            title={`Export ${monthsList[selectedMonth]} ${selectedYear} Hangar Schedule to CSV`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Download size={15} />
            <span>Export Month CSV</span>
          </button>
        </div>
      </div>

      {viewMode === 'month-gantt' && (
        <div>
          <div className="section-header">
            <h3 className="section-title">
              <BarChart3 size={20} className="text-muted" />
              <span>Full Month Bar Graph Timeline — {monthsList[selectedMonth]} {selectedYear} (Dates 1 to {monthDaysList.length})</span>
            </h3>
          </div>
          <GanttChartMatrix daysList={monthDaysList} hangarList={HANGAR_LIST} bookings={bookings} onViewDetail={onViewBookingDetail} isMonthView={true} />
        </div>
      )}

      {viewMode === 'week-gantt' && (
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 className="section-title">
              <BarChart3 size={20} className="text-muted" />
              <span>Weekly Bar Graph Timeline ({weekDaysList[0].dateSub} – {weekDaysList[6].dateSub})</span>
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrevWeek} title="Navigate to Previous Week">
                <ChevronLeft size={16} />
                <span>Prev Week</span>
              </button>
              <input 
                type="date" 
                className="form-input font-mono" 
                style={{ width: '145px', padding: '0.35rem 0.5rem', fontSize: '0.825rem', fontWeight: 700 }} 
                value={selectedDayDate} 
                onChange={(e) => handleDayDateChange(e.target.value)} 
              />
              <button className="btn btn-secondary btn-sm" onClick={handleNextWeek} title="Navigate to Next Week">
                <span>Next Week</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <GanttChartMatrix daysList={weekDaysList} hangarList={HANGAR_LIST} bookings={bookings} onViewDetail={onViewBookingDetail} isMonthView={false} />
        </div>
      )}

      {viewMode === 'day-gantt' && (
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-title">
              <Clock size={20} className="text-muted" />
              <span>Daily 24-Hour Time Slot Bar Graph (00:00 ➔ 24:00) — {selectedDayDate}</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="detail-label" style={{ fontSize: '0.75rem' }}>Change Date:</span>
              <input type="date" className="form-input font-mono" style={{ width: '150px', padding: '0.35rem 0.5rem', fontSize: '0.825rem', fontWeight: 700 }} value={selectedDayDate} onChange={(e) => handleDayDateChange(e.target.value)} />
            </div>
          </div>
          <DayHourlyGanttMatrix dateStr={selectedDayDate} hangarList={HANGAR_LIST} bookings={bookings} onViewDetail={onViewBookingDetail} />
        </div>
      )}

      {/* 4. MONTH GRID CALENDAR VIEW */}
      {viewMode === 'month-grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Month Grid Container */}
          <div className="table-container" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            {/* Weekday Labels (Sun -> Sat) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minWidth: '650px', gap: '0.5rem', textAlign: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--color-slate-200)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Month Day Cells Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minWidth: '650px', gap: '0.5rem' }}>
              {daysGrid.map((dayItem, idx) => {
                if (!dayItem) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      style={{
                        minHeight: '105px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-slate-200)'
                      }}
                    ></div>
                  );
                }

                const dayBookings = getBookingsForDay(dayItem.dateStr);
                const isSelected = selectedDayDate === dayItem.dateStr;
                const isToday = dayItem.dateStr === '2026-07-24';

                return (
                  <div
                    key={dayItem.dateStr}
                    onClick={() => setSelectedDayDate(dayItem.dateStr)}
                    style={{
                      minHeight: '105px',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected 
                        ? '2px solid var(--color-primary)' 
                        : isToday 
                        ? '2px solid var(--color-success)' 
                        : '1px solid var(--color-slate-200)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.35rem',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.9rem', color: isToday ? 'var(--color-success)' : 'var(--color-navy)' }}>
                        {dayItem.dayNumber}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="status-badge available" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                          {dayBookings.length} {dayBookings.length === 1 ? 'Flight' : 'Flights'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, justifyContent: 'flex-end' }}>
                      {dayBookings.slice(0, 2).map(b => (
                        <div
                          key={b.id}
                          style={{
                            padding: '0.25rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: b.manufacturer === 'Airbus' ? '#0284c7' : '#4f46e5',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {b.aircraftReg} ({b.hangarId})
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-slate-500)', fontWeight: 700, textAlign: 'right' }}>
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="table-container" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <div style={{ borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div className="detail-label">Daily Hangar Schedule</div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)', fontSize: '1.1rem' }}>{selectedDayDate ? new Date(selectedDayDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Select a Date'}</h3>
            </div>
            {activeDayBookings.length === 0 ? (
              <div className="empty-state-text" style={{ padding: '2rem 0' }}><Plane size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><div>No aircraft arrival or maintenance scheduled for this date.</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeDayBookings.map(b => (
                  <div key={b.id} style={{ border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '0.9rem' }}>{b.aircraftReg} ({b.operator})</span>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '0.85rem' }}>{b.hangarId}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--color-slate-600)' }}><MapPin size={13} className="text-muted" /><span>Route: {b.route || 'ORIGIN ➔ HYD'} ({b.flightNo})</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--color-slate-600)' }}><Wrench size={13} className="text-muted" /><span>{b.maintenanceType}</span></div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem' }} onClick={() => onViewBookingDetail(b)}><Eye size={13} /><span>Full Booking Specs</span></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Upload & Visualize CSV Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={() => {
          if (refreshTrigger) refreshTrigger();
        }}
        showToast={showToast}
      />
    </div>
  );
};

export default CalendarView;
