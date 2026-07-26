// GMR Aero Technic Authentication Service
const API_BASE = '/api/auth';
const TOKEN_KEY = 'gmr_auth_token_v1';
const USER_KEY = 'gmr_auth_user_v1';

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return data;
};

export const verifyOtp = async (email, otp) => {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid OTP verification code');
  }

  if (data.token && data.user) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
};

export const resendOtp = async (email) => {
  const res = await fetch(`${API_BASE}/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);
  if (!userJson || !token) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
