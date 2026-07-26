import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Booking from './models/Booking.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shanmukhasrinivasmoganti_db_user:22uJJPVyWndtXGSd@cluster0.tacmmth.mongodb.net/gmr_hangar_db?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'gmr_aero_technic_jwt_secret_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Global MongoDB connection state
let isMongoConnected = false;
let mongoErrorDetails = null;

// Initial Seed User Details (as requested)
const SEED_USER = {
  name: 'Shanmukha Srinivasa Moganti',
  email: 'shanmukhasrinivasmoganti@gmail.com',
  password: '123', // Will be bcrypt hashed
  role: 'Shift Lead Controller'
};

// Initial Seed Bookings
const SEED_BOOKINGS = [
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

// In-memory fallback objects in case MongoDB is unreachable
let memoryUsers = [];
let memoryBookings = [...SEED_BOOKINGS];

// Nodemailer Transporter Setup for Gmail SMTP
const createNodemailerTransporter = () => {
  const emailUser = process.env.EMAIL_USER || 'shanmukhasrinivasmoganti@gmail.com';
  const emailPass = (process.env.EMAIL_PASS || 'gxlm ugjz ctyc pneq').trim().replace(/\s+/g, '');

  console.log(`📧 Configuring Nodemailer with Gmail SMTP user: ${emailUser}`);
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

const transporter = createNodemailerTransporter();

// Helper to seed initial User and Bookings in MongoDB
const seedDatabaseIfEmpty = async () => {
  try {
    // Seed Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      console.log('🌱 Seeding 9 initial aircraft bookings into MongoDB...');
      await Booking.insertMany(SEED_BOOKINGS);
      console.log('✅ Hangar bookings seeded successfully!');
    }

    // Seed User (shanmukhasrinivasmoganti@gmail.com / 123)
    const existingUser = await User.findOne({ email: SEED_USER.email.toLowerCase() });
    if (!existingUser) {
      console.log(`👤 Seeding initial authorized user: ${SEED_USER.email}`);
      const hashedPassword = await bcrypt.hash(SEED_USER.password, 10);
      await User.create({
        name: SEED_USER.name,
        email: SEED_USER.email.toLowerCase(),
        password: hashedPassword,
        role: SEED_USER.role
      });
      console.log('✅ Initial user account seeded successfully in MongoDB!');
    } else {
      console.log(`👤 Authorized user ${SEED_USER.email} exists in MongoDB.`);
    }
  } catch (err) {
    console.error('❌ Failed during MongoDB seeding:', err.message);
  }
};

// Seed Memory fallback user as well
(async () => {
  const hashedPassword = await bcrypt.hash(SEED_USER.password, 10);
  memoryUsers.push({
    name: SEED_USER.name,
    email: SEED_USER.email.toLowerCase(),
    password: hashedPassword,
    role: SEED_USER.role,
    otp: null,
    otpExpires: null
  });
})();

// Serverless MongoDB Connection Manager
let cachedDb = null;
const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    isMongoConnected = true;
    mongoErrorDetails = null;
    cachedDb = db;
    console.log('🟢 MongoDB Atlas Connected Successfully!');
    await seedDatabaseIfEmpty();
    return db;
  } catch (err) {
    isMongoConnected = false;
    mongoErrorDetails = err.message;
    console.warn('⚠️ MongoDB Atlas Connection Warning:', err.message);
    return null;
  }
};

// Express Middleware: Ensure MongoDB is connected before route handlers
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// Overlap validation helper
const isOverlapping = (startA, endA, startB, endB) => {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && aEnd > bStart;
};

// Send Styled OTP Email Helper
const sendOtpEmail = async (userEmail, userName, otpCode) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 2rem; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 1rem;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 1.5rem;">✈️ GMR Aero Technic MRO</h2>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.25rem;">Station Security Control Center</p>
      </div>

      <p style="font-size: 1rem; color: #e2e8f0;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 0.925rem; color: #cbd5e1; line-height: 1.5;">
        Your 2-Step Verification Security Code for accessing the GMR Aero Technic Hangar Booking portal is:
      </p>

      <div style="text-align: center; margin: 2rem 0;">
        <span style="font-family: 'Courier New', monospace; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #0284c7; background-color: #e0f2fe; padding: 0.75rem 1.75rem; border-radius: 8px; display: inline-block; border: 2px dashed #0284c7;">
          ${otpCode}
        </span>
      </div>

      <p style="font-size: 0.85rem; color: #94a3b8;">
        This OTP is valid for <strong>10 minutes</strong>. Do not share this authentication code with anyone.
      </p>

      <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #334155; text-align: center; font-size: 0.75rem; color: #64748b;">
        © 2026 GMR Aero Technic MRO Base — All Rights Reserved.
      </div>
    </div>
  `;

  const senderEmail = process.env.EMAIL_USER || 'shanmukhasrinivasmoganti@gmail.com';
  try {
    const info = await transporter.sendMail({
      from: `"GMR Aero Technic MRO Security" <${senderEmail}>`,
      to: userEmail,
      subject: `🔐 GMR Aero Technic 2-Step OTP Verification Code: ${otpCode}`,
      text: `Your GMR Aero Technic MRO Verification OTP is: ${otpCode}`,
      html: htmlContent
    });
    console.log(`✅ Nodemailer successfully sent OTP email to ${userEmail} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error(`❌ SMTP Mail Delivery Error (${err.message}):`, err);
  }
};

// ==========================================
// AUTHENTICATION REST API ROUTES
// ==========================================

// POST /api/auth/login - Validate Email & Password, Generate & Email 6-Digit OTP
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing Credentials', message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication Failed', message: 'Invalid email or password.' });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Authentication Failed', message: 'Invalid email or password.' });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (isMongoConnected) {
      user.otp = otpCode;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user.otp = otpCode;
      user.otpExpires = otpExpires;
    }

    // Dispatch OTP email via Nodemailer
    try {
      await sendOtpEmail(user.email, user.name, otpCode);
    } catch (mailErr) {
      console.warn('⚠️ Nodemailer mail dispatch warning:', mailErr.message);
    }

    // Always log OTP prominently in console for testing/debugging
    console.log(`✉️  [OTP MAIL DISPATCH SIMULATION] Sent OTP [ ${otpCode} ] to mail ${user.email}`);

    return res.json({
      message: 'Password verified. A 6-digit OTP code has been dispatched to your email.',
      email: user.email,
      requiresOtp: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error', message: err.message });
  }
});

// POST /api/auth/verify-otp - Verify 6-digit OTP & Return JWT Auth Token
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and 6-digit OTP are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user || !user.otp) {
      return res.status(400).json({ error: 'Verification Failed', message: 'No active OTP request found. Please request a new OTP.' });
    }

    // Validate OTP expiry
    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ error: 'OTP Expired', message: 'The OTP code has expired. Please click Resend OTP.' });
    }

    // Validate OTP match
    if (user.otp !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid OTP', message: 'The entered 6-digit OTP code is incorrect.' });
    }

    // Clear OTP from DB after successful verification
    if (isMongoConnected) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
    } else {
      user.otp = null;
      user.otpExpires = null;
    }

    // Issue JWT Token
    const payload = { email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    console.log(`🟢 User ${user.email} successfully authenticated with 2-Step OTP!`);

    return res.json({
      message: 'Authentication successful! Welcome to GMR Aero Technic MRO Base.',
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'OTP Verification error', message: err.message });
  }
});

// POST /api/auth/resend-otp - Regenerate and Re-send OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const cleanEmail = email.trim().toLowerCase();
    let user = isMongoConnected ? await User.findOne({ email: cleanEmail }) : memoryUsers.find(u => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (isMongoConnected) {
      user.otp = otpCode;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user.otp = otpCode;
      user.otpExpires = otpExpires;
    }

    try {
      await sendOtpEmail(user.email, user.name, otpCode);
    } catch (mailErr) {}

    console.log(`✉️  [OTP MAIL DISPATCH SIMULATION] Sent OTP [ ${otpCode} ] to mail ${user.email}`);

    return res.json({ message: 'New 6-digit OTP code has been dispatched to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Resend OTP error', message: err.message });
  }
});

// GET /api/auth/me - Validate token
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ==========================================
// REST API SYSTEM & BOOKING ROUTES
// ==========================================

// GET /api/status - Server & Database Status
app.get('/api/status', async (req, res) => {
  let count = 0;
  if (isMongoConnected) {
    try {
      count = await Booking.countDocuments();
    } catch (e) {}
  } else {
    count = memoryBookings.length;
  }

  res.json({
    status: 'ok',
    database: isMongoConnected ? 'MongoDB' : 'In-Memory Fallback',
    isMongoConnected,
    mongoUri: MONGODB_URI,
    error: mongoErrorDetails,
    totalBookings: count,
    timestamp: new Date().toISOString()
  });
});

// GET /api/bookings - Fetch all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    if (isMongoConnected) {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.json(bookings);
    } else {
      return res.json(memoryBookings);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', message: err.message });
  }
});

// POST /api/bookings - Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    let currentBookings = isMongoConnected ? await Booking.find() : memoryBookings;

    const conflict = currentBookings.find(b => {
      if (b.hangarId !== bookingData.hangarId) return false;
      return isOverlapping(bookingData.startDate, bookingData.endDate, b.startDate, b.endDate);
    });

    if (conflict) {
      return res.status(400).json({ 
        error: 'Slot Unavailable', 
        message: `Selected ${bookingData.hangarId} is already occupied by ${conflict.aircraftReg} (${conflict.operator}) during this window.` 
      });
    }

    const newBooking = {
      ...bookingData,
      id: bookingData.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      flightNo: bookingData.flightNo || `FL-${Math.floor(100 + Math.random() * 900)}`,
      route: bookingData.route || 'ORIGIN ➔ HYD',
      status: bookingData.status || 'Scheduled Inbound',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const savedDoc = await Booking.create(newBooking);
      return res.status(201).json(savedDoc);
    } else {
      memoryBookings.unshift(newBooking);
      return res.status(201).json(newBooking);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking', message: err.message });
  }
});

// PUT /api/bookings/:id - Update booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let currentBookings = isMongoConnected ? await Booking.find() : memoryBookings;

    const conflict = currentBookings.find(b => {
      if (b.id === id) return false;
      if (b.hangarId !== updateData.hangarId) return false;
      return isOverlapping(updateData.startDate, updateData.endDate, b.startDate, b.endDate);
    });

    if (conflict) {
      return res.status(400).json({ 
        error: 'Slot Unavailable', 
        message: `${updateData.hangarId} is already occupied by ${conflict.aircraftReg} during this period.` 
      });
    }

    if (isMongoConnected) {
      const updated = await Booking.findOneAndUpdate({ id }, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'Booking not found' });
      return res.json(updated);
    } else {
      const idx = memoryBookings.findIndex(b => b.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
      memoryBookings[idx] = { ...memoryBookings[idx], ...updateData };
      return res.json(memoryBookings[idx]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking', message: err.message });
  }
});

// DELETE /api/bookings/:id - Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const deleted = await Booking.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Booking not found' });
      return res.json({ message: 'Booking deleted successfully from MongoDB', id });
    } else {
      const initialLen = memoryBookings.length;
      memoryBookings = memoryBookings.filter(b => b.id !== id);
      if (memoryBookings.length === initialLen) return res.status(404).json({ error: 'Booking not found' });
      return res.json({ message: 'Booking deleted successfully', id });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking', message: err.message });
  }
});

// POST /api/bookings/reset - Reset database
app.post('/api/bookings/reset', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Booking.deleteMany({});
      const seeded = await Booking.insertMany(SEED_BOOKINGS);
      return res.json({ message: 'MongoDB database reset to default seed data', count: seeded.length, bookings: seeded });
    } else {
      memoryBookings = [...SEED_BOOKINGS];
      return res.json({ message: 'Database reset to default seed data', count: memoryBookings.length, bookings: memoryBookings });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset database', message: err.message });
  }
});

// POST /api/bookings/import - Batch import CSV bookings
app.post('/api/bookings/import', async (req, res) => {
  try {
    const { newBookings } = req.body;
    if (!Array.isArray(newBookings) || newBookings.length === 0) {
      return res.status(400).json({ error: 'Invalid payload', message: 'newBookings array required' });
    }

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

    if (isMongoConnected) {
      const inserted = await Booking.insertMany(processed);
      const all = await Booking.find().sort({ createdAt: -1 });
      return res.json({ message: `Successfully imported ${inserted.length} bookings to MongoDB`, bookings: all });
    } else {
      memoryBookings = [...processed, ...memoryBookings];
      return res.json({ message: `Successfully imported ${processed.length} bookings`, bookings: memoryBookings });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to import CSV bookings', message: err.message });
  }
});

// Start Express server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 GMR Aero Technic MongoDB Express Server Running!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`===================================================`);
  });
}

export default app;
