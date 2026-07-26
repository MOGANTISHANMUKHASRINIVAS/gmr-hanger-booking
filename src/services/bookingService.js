// GMR Aero Technic MRO Booking Service & MongoDB API Persistence Engine
const API_BASE = '/api';
const STORAGE_KEY = 'gmr_hangar_bookings_v2';

// In-memory cache for ultra-fast local renders & offline fallback
let cachedBookings = [];
let isCacheLoaded = false;

// Real photorealistic aircraft image mapping per model
export const AIRCRAFT_IMAGES = {
  'A320': './assets/airbus_a320.png',
  'A320neo': './assets/airbus_a320.png',
  'A321': './assets/airbus_a320.png',
  'A321neo': './assets/airbus_a320.png',
  'A350': './assets/airbus_a350.png',
  'A380': './assets/airbus_a380.png',
  'B737-700': './assets/boeing_737.png',
  'B737-800': './assets/boeing_737.png',
  'B737 MAX 8': './assets/boeing_737.png',
  'B777': './assets/boeing_777.png',
  'B777X': './assets/boeing_777.png',
  'B787-8': './assets/boeing_787.png',
  'B787-9': './assets/boeing_787.png',
  'B787-10': './assets/boeing_787.png'
};

export const getAircraftImageUrl = (manufacturer, aircraftType, customUrl) => {
  if (customUrl && customUrl.trim() !== '') return customUrl;
  if (aircraftType && AIRCRAFT_IMAGES[aircraftType]) {
    return AIRCRAFT_IMAGES[aircraftType];
  }
  return manufacturer === 'Airbus' ? './assets/airbus_a320.png' : './assets/boeing_787.png';
};

// Initial pre-populated seed data
export const INITIAL_BOOKINGS = [
  {
    id: 'BK-1001',
    hangarId: 'Hangar 2',
    aircraftReg: 'VT-ISB',
    flightNo: '6E-2041',
    route: 'DEL ➔ HYD',
    operator: 'IndiGo Airlines',
    manufacturer: 'Airbus',
    aircraftType: 'A320neo',
    maintenanceType: 'C Check',
    engineerName: 'Eng. Rajesh Kumar',
    status: 'Docked in Hangar',
    imageUrl: './assets/airbus_a320.png',
    remarks: 'Scheduled 12,000 flight hours structural inspection & avionics upgrade.',
    startDate: '2026-07-22T08:00',
    endDate: '2026-07-28T18:00',
    createdAt: '2026-07-20T10:00:00.000Z'
  },
  {
    id: 'BK-1002',
    hangarId: 'Hangar 5',
    aircraftReg: 'VT-EXJ',
    flightNo: 'AI-102',
    route: 'JFK ➔ DEL ➔ HYD',
    operator: 'Air India',
    manufacturer: 'Boeing',
    aircraftType: 'B787-8',
    maintenanceType: 'Heavy Check',
    engineerName: 'Eng. Vikram Rao',
    status: 'Maintenance In Progress',
    imageUrl: './assets/boeing_787.png',
    remarks: 'Full composite hull scan and GEnx engine overhaul in Bay B.',
    startDate: '2026-07-20T06:00',
    endDate: '2026-07-30T20:00',
    createdAt: '2026-07-18T14:30:00.000Z'
  },
  {
    id: 'BK-1003',
    hangarId: 'Hangar 8',
    aircraftReg: 'A6-EUA',
    flightNo: 'EK-501',
    route: 'DXB ➔ HYD',
    operator: 'Emirates',
    manufacturer: 'Airbus',
    aircraftType: 'A380',
    maintenanceType: 'Engine Inspection',
    engineerName: 'Eng. David Miller',
    status: 'Docked in Hangar',
    imageUrl: './assets/airbus_a380.png',
    remarks: 'Rolls-Royce Trent 900 turbine blade acoustic emission test.',
    startDate: '2026-07-24T00:00',
    endDate: '2026-07-26T12:00',
    createdAt: '2026-07-23T09:15:00.000Z'
  },
  {
    id: 'BK-1004',
    hangarId: 'Hangar 10',
    aircraftReg: 'VT-YAA',
    flightNo: 'QP-1102',
    route: 'BLR ➔ HYD',
    operator: 'Akasa Air',
    manufacturer: 'Boeing',
    aircraftType: 'B737 MAX 8',
    maintenanceType: 'Cabin Modification',
    engineerName: 'Eng. Anita Sharma',
    status: 'Maintenance In Progress',
    imageUrl: './assets/boeing_737.png',
    remarks: 'Wi-Fi radome installation and revised seating layout retrofit.',
    startDate: '2026-07-23T12:00',
    endDate: '2026-07-27T16:00',
    createdAt: '2026-07-22T11:00:00.000Z'
  },
  {
    id: 'BK-1005',
    hangarId: 'Hangar 1',
    aircraftReg: 'VT-TNC',
    flightNo: 'UK-815',
    route: 'BOM ➔ HYD',
    operator: 'Vistara',
    manufacturer: 'Airbus',
    aircraftType: 'A321neo',
    maintenanceType: 'A Check',
    engineerName: 'Eng. Sanjay Patel',
    status: 'Inbound / Approaching',
    imageUrl: './assets/airbus_a320.png',
    remarks: 'Routine 400 flight hour check and hydraulic system flush.',
    startDate: '2026-07-27T08:00',
    endDate: '2026-07-29T18:00',
    createdAt: '2026-07-24T08:00:00.000Z'
  },
  {
    id: 'BK-1006',
    hangarId: 'Hangar 4',
    aircraftReg: 'VT-SJA',
    flightNo: 'SG-402',
    route: 'MAA ➔ HYD',
    operator: 'SpiceJet',
    manufacturer: 'Boeing',
    aircraftType: 'B737-800',
    maintenanceType: 'Structural Repair',
    engineerName: 'Eng. Priya Nair',
    status: 'Docked in Hangar',
    imageUrl: './assets/boeing_737.png',
    remarks: 'Main landing gear door actuator skin repair.',
    startDate: '2026-07-24T14:00',
    endDate: '2026-07-25T18:00',
    createdAt: '2026-07-24T07:30:00.000Z'
  },
  {
    id: 'BK-1007',
    hangarId: 'Hangar 12',
    aircraftReg: 'A7-BFG',
    flightNo: 'QR-8804',
    route: 'DOH ➔ HYD',
    operator: 'Qatar Airways Cargo',
    manufacturer: 'Boeing',
    aircraftType: 'B777',
    maintenanceType: 'Base Maintenance',
    engineerName: 'Eng. Suresh Menon',
    status: 'Inbound / Approaching',
    imageUrl: './assets/boeing_777.png',
    remarks: 'Main cargo door seal replacement and flight deck avionics calibration.',
    startDate: '2026-07-29T09:00',
    endDate: '2026-08-04T17:00',
    createdAt: '2026-07-24T10:00:00.000Z'
  },
  {
    id: 'BK-1008',
    hangarId: 'Hangar 3',
    aircraftReg: '9V-SMA',
    flightNo: 'SQ-522',
    route: 'SIN ➔ HYD',
    operator: 'Singapore Airlines',
    manufacturer: 'Airbus',
    aircraftType: 'A350',
    maintenanceType: 'Engine Inspection',
    engineerName: 'Eng. Michael Wong',
    status: 'Scheduled Inbound',
    imageUrl: './assets/airbus_a350.png',
    remarks: 'Trent XWB engine harmonic testing and cowl panel inspection.',
    startDate: '2026-08-02T10:00',
    endDate: '2026-08-07T16:00',
    createdAt: '2026-07-24T11:00:00.000Z'
  },
  {
    id: 'BK-1009',
    hangarId: 'Hangar 7',
    aircraftReg: 'N787AV',
    flightNo: 'UA-801',
    route: 'ORD ➔ DEL ➔ HYD',
    operator: 'United Airlines',
    manufacturer: 'Boeing',
    aircraftType: 'B787-9',
    maintenanceType: 'Heavy Check',
    engineerName: 'Eng. Sarah Jenkins',
    status: 'Scheduled Inbound',
    imageUrl: './assets/boeing_787.png',
    remarks: 'Pre-transatlantic long haul D-Check structural review.',
    startDate: '2026-08-10T08:00',
    endDate: '2026-08-18T20:00',
    createdAt: '2026-07-24T11:30:00.000Z'
  }
];

export const AIRCRAFT_DATA = {
  Airbus: [
    'A220', 'A318', 'A319', 'A320', 'A320neo',
    'A321', 'A321neo', 'A330', 'A340', 'A350', 'A380'
  ],
  Boeing: [
    'B737-700', 'B737-800', 'B737 MAX 8', 'B747', 'B757',
    'B767', 'B777', 'B777X', 'B787-8', 'B787-9', 'B787-10'
  ]
};

export const MAINTENANCE_TYPES = [
  'Line Maintenance',
  'Base Maintenance',
  'Engine Inspection',
  'Structural Repair',
  'Cabin Modification',
  'Heavy Check',
  'A Check',
  'C Check'
];

export const TOTAL_HANGARS = 12;
export const HANGAR_LIST = Array.from({ length: TOTAL_HANGARS }, (_, i) => `Hangar ${i + 1}`);

// Fetch Server / MongoDB Status
export const getDbStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/status`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    throw new Error('Static Host / Offline');
  } catch (err) {
    return {
      status: 'offline',
      database: 'Local Persistence / Active',
      isMongoConnected: false,
      error: err.message
    };
  }
};

// Async Fetch All Bookings from Express MongoDB REST API
export const fetchBookings = async () => {
  try {
    const res = await fetch(`${API_BASE}/bookings`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      cachedBookings = data;
      isCacheLoaded = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    throw new Error('Static Host / Offline');
  } catch (err) {
    console.warn('⚠️ Fetching from REST API fallback to local storage:', err.message);
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        cachedBookings = JSON.parse(local);
      } catch (e) {
        cachedBookings = INITIAL_BOOKINGS;
      }
    } else {
      cachedBookings = INITIAL_BOOKINGS;
    }
    isCacheLoaded = true;
    return cachedBookings;
  }
};

// Sync Getter from local cache
export const getBookings = () => {
  if (!isCacheLoaded || cachedBookings.length === 0) {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        cachedBookings = JSON.parse(local);
      } catch (e) {
        cachedBookings = INITIAL_BOOKINGS;
      }
    } else {
      cachedBookings = INITIAL_BOOKINGS;
    }
  }
  return cachedBookings;
};

// Reset Database to Initial Seed Data
export const resetToInitialData = async () => {
  try {
    const res = await fetch(`${API_BASE}/bookings/reset`, { method: 'POST' });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      cachedBookings = data.bookings || INITIAL_BOOKINGS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
      return cachedBookings;
    }
    throw new Error('Static Host Reset');
  } catch (err) {
    console.warn('Fallback resetting local cache:', err.message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    cachedBookings = INITIAL_BOOKINGS;
    return INITIAL_BOOKINGS;
  }
};

// Overlap Validator Helper
export const isOverlapping = (startA, endA, startB, endB) => {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && aEnd > bStart;
};

// Check Slot Availability
export const checkSlotAvailability = (hangarId, startDateStr, endDateStr, excludeBookingId = null) => {
  if (!hangarId || !startDateStr || !endDateStr) {
    return { isAvailable: false, message: 'Please select a hangar, start date, and end date.', conflictingBooking: null };
  }

  const newStart = new Date(startDateStr).getTime();
  const newEnd = new Date(endDateStr).getTime();

  if (isNaN(newStart) || isNaN(newEnd)) {
    return { isAvailable: false, message: 'Invalid start or end date format.', conflictingBooking: null };
  }

  if (newEnd <= newStart) {
    return { isAvailable: false, message: 'End Date & Time must be after Start Date & Time.', conflictingBooking: null };
  }

  const allBookings = getBookings();
  
  const conflict = allBookings.find(b => {
    if (b.hangarId !== hangarId) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return isOverlapping(startDateStr, endDateStr, b.startDate, b.endDate);
  });

  if (conflict) {
    return {
      isAvailable: false,
      message: 'Selected hangar is already occupied during this period.',
      conflictingBooking: conflict
    };
  }

  return {
    isAvailable: true,
    message: 'Hangar available.',
    conflictingBooking: null
  };
};

// Save Booking to MongoDB
export const saveBooking = async (bookingData) => {
  const validation = checkSlotAvailability(bookingData.hangarId, bookingData.startDate, bookingData.endDate);
  if (!validation.isAvailable) {
    throw new Error(validation.message);
  }

  const imageUrl = getAircraftImageUrl(bookingData.manufacturer, bookingData.aircraftType, bookingData.imageUrl);

  const payload = {
    ...bookingData,
    id: bookingData.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    flightNo: bookingData.flightNo || `FL-${Math.floor(100 + Math.random() * 900)}`,
    route: bookingData.route || 'ORIGIN ➔ HYD',
    status: bookingData.status || 'Scheduled Inbound',
    imageUrl: imageUrl,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to save booking');
    }

    const saved = await res.json();
    cachedBookings.unshift(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return saved;
  } catch (err) {
    console.warn('Fallback saving to local cache:', err.message);
    cachedBookings.unshift(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return payload;
  }
};

// Update Booking in MongoDB
export const updateBooking = async (id, bookingData) => {
  const validation = checkSlotAvailability(bookingData.hangarId, bookingData.startDate, bookingData.endDate, id);
  if (!validation.isAvailable) {
    throw new Error(validation.message);
  }

  try {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to update booking');
    }

    const updated = await res.json();
    const idx = cachedBookings.findIndex(b => b.id === id);
    if (idx !== -1) cachedBookings[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return updated;
  } catch (err) {
    console.warn('Fallback updating local cache:', err.message);
    const idx = cachedBookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    cachedBookings[idx] = { ...cachedBookings[idx], ...bookingData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return cachedBookings[idx];
  }
};

// Delete Booking from MongoDB
export const deleteBooking = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to delete booking');
    }
    cachedBookings = cachedBookings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return true;
  } catch (err) {
    console.warn('Fallback deleting from local cache:', err.message);
    cachedBookings = cachedBookings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return true;
  }
};

// Dynamic Hangar Status Matrix
export const getHangarStatuses = (referenceDateISO = new Date('2026-07-24').toISOString()) => {
  const bookings = getBookings();
  const refTime = new Date(referenceDateISO).getTime();

  return HANGAR_LIST.map((hangarName, index) => {
    const activeBooking = bookings.find(b => {
      if (b.hangarId !== hangarName) return false;
      const start = new Date(b.startDate).getTime();
      const end = new Date(b.endDate).getTime();
      return refTime >= start && refTime <= end;
    });

    const upcomingBookings = bookings
      .filter(b => b.hangarId === hangarName && new Date(b.startDate).getTime() > refTime)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return {
      id: index + 1,
      name: hangarName,
      isOccupied: !!activeBooking,
      activeBooking: activeBooking || null,
      nextBooking: upcomingBookings[0] || null
    };
  });
};

// Batch Import Bookings from CSV to MongoDB
export const importBookingsFromCSV = async (newBookings) => {
  try {
    const res = await fetch(`${API_BASE}/bookings/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newBookings })
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'CSV Import failed');
    }

    const data = await res.json();
    cachedBookings = data.bookings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return cachedBookings;
  } catch (err) {
    console.warn('Fallback importing CSV to local cache:', err.message);
    const existing = getBookings();
    const processed = newBookings.map((b, idx) => ({
      id: b.id || `BK-${Math.floor(1000 + Math.random() * 9000 + idx)}`,
      aircraftReg: b.aircraftReg || 'VT-NEW',
      flightNo: b.flightNo || `FL-${Math.floor(100 + Math.random() * 900)}`,
      route: b.route || 'ORIGIN ➔ HYD',
      operator: b.operator || 'Commercial Carrier',
      manufacturer: (b.manufacturer || 'Airbus').includes('Boeing') ? 'Boeing' : 'Airbus',
      aircraftType: b.aircraftType || 'A320neo',
      hangarId: b.hangarId || 'Hangar 1',
      maintenanceType: b.maintenanceType || 'Line Maintenance',
      engineerName: b.engineerName || 'Lead Engineer',
      startDate: (b.startDate || '2026-07-25T08:00').replace(' ', 'T'),
      endDate: (b.endDate || '2026-07-29T18:00').replace(' ', 'T'),
      status: b.status || 'Scheduled Inbound',
      imageUrl: b.imageUrl || './assets/airbus_a320.png',
      remarks: b.remarks || 'Imported via CSV schedule loader.',
      createdAt: new Date().toISOString()
    }));
    cachedBookings = [...processed, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBookings));
    return cachedBookings;
  }
};
