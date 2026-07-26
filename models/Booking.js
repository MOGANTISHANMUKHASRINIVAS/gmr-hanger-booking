import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hangarId: {
    type: String,
    required: true
  },
  aircraftReg: {
    type: String,
    required: true
  },
  flightNo: {
    type: String,
    default: 'FL-000'
  },
  route: {
    type: String,
    default: 'DEL ➔ HYD'
  },
  operator: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true,
    enum: ['Airbus', 'Boeing']
  },
  aircraftType: {
    type: String,
    required: true
  },
  maintenanceType: {
    type: String,
    required: true
  },
  engineerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Docked in Hangar'
  },
  imageUrl: {
    type: String,
    default: './assets/airbus_a320.png'
  },
  remarks: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
