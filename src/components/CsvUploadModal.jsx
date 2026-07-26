import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, BarChart3, Plane } from 'lucide-react';
import { importBookingsFromCSV } from '../services/bookingService';

const CsvUploadModal = ({ isOpen, onClose, onImportSuccess, showToast }) => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // Handle CSV file selection and parsing
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSVText(text);
        if (rows.length === 0) {
          setErrorMsg('No valid rows found in the CSV file.');
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch (err) {
        setErrorMsg('Failed to parse CSV file format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  // CSV Parser Helper
  const parseCSVText = (csvText) => {
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Match values considering quoted strings
      const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      const cols = matches 
        ? matches.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) 
        : line.split(',');

      if (cols.length >= 4) {
        results.push({
          id: cols[0] || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
          aircraftReg: cols[1] || 'VT-ISX',
          flightNo: cols[2] || '6E-301',
          route: cols[3] || 'DEL ➔ HYD',
          operator: cols[4] || 'IndiGo Airlines',
          manufacturer: (cols[5] || 'Airbus').includes('Boeing') ? 'Boeing' : 'Airbus',
          aircraftType: cols[6] || 'A320neo',
          hangarId: cols[7] || 'Hangar 3',
          maintenanceType: cols[8] || 'C Check',
          engineerName: cols[9] || 'Eng. Rajesh Kumar',
          startDate: (cols[10] || '2026-07-25 08:00').replace(' ', 'T'),
          endDate: (cols[11] || '2026-07-29 18:00').replace(' ', 'T'),
          status: cols[12] || 'Docked in Hangar',
          remarks: cols[13] || 'Imported via CSV file.'
        });
      }
    }
    return results;
  };

  // Execute Import into MongoDB Service
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      await importBookingsFromCSV(parsedRows);
      if (showToast) showToast(`Successfully imported ${parsedRows.length} flights into MongoDB!`, 'success');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      setErrorMsg('Failed to save imported CSV records.');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const csvContent = 
`Booking ID,Aircraft Reg,Flight No,Route,Operator,Manufacturer,Type,Hangar,Maintenance Type,Engineer,Start Date,End Date,Status,Remarks
BK-9001,VT-GMR,6E-1002,DEL ➔ HYD,IndiGo,Airbus,A320neo,Hangar 3,C Check,Eng. Rajesh Patel,2026-07-22 08:00,2026-07-28 18:00,Docked,Scheduled C Check
BK-9002,VT-AER,AI-204,BOM ➔ HYD,Air India,Boeing,B787-8,Hangar 6,Heavy Check,Eng. Vikram Rao,2026-07-24 06:00,2026-07-30 20:00,In Progress,Composite scan
BK-9003,A6-EMR,EK-505,DXB ➔ HYD,Emirates,Airbus,A380,Hangar 9,Engine Inspection,Eng. David Miller,2026-07-26 10:00,2026-07-29 14:00,Scheduled,Turbine scan`;

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_GMR_Hangar_Schedule_Import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sidebar-logo-icon" style={{ width: 36, height: 36 }}>
              <Upload size={18} />
            </div>
            <div>
              <h2 className="modal-title">Upload & Import CSV Schedule Data into MongoDB</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                Import external flight maintenance CSV schedules directly into MongoDB database
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sample CSV Download Callout */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--color-navy)', fontWeight: 600 }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Need a CSV format template? Download pre-formatted sample schedule file:</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={downloadSampleTemplate} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Download size={14} />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* File Drag and Drop Upload Zone */}
          <div 
            style={{
              border: '2px dashed var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#f0f9ff',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onClick={() => document.getElementById('csvFileInput').click()}
          >
            <input 
              id="csvFileInput" 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <Upload size={36} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '1rem' }}>
              {file ? file.name : 'Click or Drag & Drop CSV File Here'}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
              Supports .csv files containing Flight Reg, Operator, Hangar Bay, Scope, & Start/End Dates
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Rows Live Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                  CSV Preview — {parsedRows.length} New Flights Detected:
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={14} /> Ready to Import
                </span>
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)' }}>
                <table className="data-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafafa' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Reg</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Operator</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Hangar</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Scope</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Start Date</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '0.4rem 0.6rem', fontWeight: 800 }}>{r.aircraftReg}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.operator}</td>
                        <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{r.hangarId}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.maintenanceType}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }} className="font-mono">{r.startDate.replace('T', ' ')}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }} className="font-mono">{r.endDate.replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isImporting}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleConfirmImport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <BarChart3 size={16} />
            <span>{isImporting ? 'Importing into MongoDB...' : `Import into MongoDB (${parsedRows.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal;
