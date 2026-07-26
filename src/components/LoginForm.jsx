import React, { useState, useRef, useEffect } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { login, verifyOtp, resendOtp } from '../services/authService';

const LoginForm = ({ onLoginSuccess, showToast }) => {
  const [step, setStep] = useState(1); // 1 = Login credentials, 2 = OTP verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State (6 Digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend Timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Login Credentials Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);
      setStep(2);
      setResendCooldown(30);
      if (showToast) showToast(res.message || 'OTP dispatched to your email.', 'info');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    // Auto-advance focus
    if (value && index < 5) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  // Handle OTP KeyDown for Backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current.focus();
    }
  };

  // Handle Paste 6-Digit OTP
  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpDigits(digits);
      otpInputRefs[5].current.focus();
    }
  };

  // Handle Step 2: OTP Verification Submit
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, enteredOtp);
      setLoading(false);
      if (showToast) showToast('Access Granted! Welcome to GMR MRO Control.', 'success');
      if (onLoginSuccess) onLoginSuccess(res.user);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid OTP code.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await resendOtp(email);
      setLoading(false);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      if (showToast) showToast(res.message || 'New OTP dispatched!', 'info');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "url('/gmr_hangar_bg.png'), url('/gmr_rgia_mro_bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Soft Luminous Backdrop Overlay so GMR Hangar 2nd Picture is visible */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 27, 51, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1
        }}
      />

      {/* Main Rectangular White Authentication Block */}
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          border: '2.5px solid #0284c7',
          borderRadius: '12px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 25px 60px rgba(0, 32, 74, 0.45), 0 0 35px rgba(2, 132, 199, 0.3)',
          color: '#0f172a',
          zIndex: 10,
          position: 'relative'
        }}
      >
        {/* Generated GMR Corporate Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/gmr_generated_logo.png" 
            alt="GMR Logo" 
            style={{ height: '75px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Step 2 Header Title */}
        {step === 2 && (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              2-Step OTP Verification
            </h2>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #ef4444',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} style={{ shrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: EMAIL & PASSWORD LOGIN FORM */}
        {step === 1 && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#1e293b', fontWeight: 700 }}>
                <Mail size={16} style={{ color: '#0284c7' }} />
                <span>Station Email Address</span>
              </label>
              <input
                type="email"
                placeholder="e.g. controller@gmraerotechnic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  padding: '0.8rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0284c7';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#1e293b', fontWeight: 700 }}>
                <Lock size={16} style={{ color: '#0284c7' }} />
                <span>Security Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    padding: '0.8rem 2.75rem 0.8rem 1rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '8px',
                marginTop: '0.5rem',
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                  e.target.style.transform = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  <span>Verifying Credentials & Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Send OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div 
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#e0f2fe',
                border: '1.5px solid #7dd3fc',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#0369a1'
              }}
            >
              <div style={{ fontWeight: 600 }}>OTP dispatched via Nodemailer to:</div>
              <strong style={{ color: '#0284c7', fontSize: '0.925rem', wordBreak: 'break-all' }}>{email}</strong>
            </div>

            {/* 6-Digit Inputs */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Enter 6-Digit OTP Code
              </label>
              <div 
                style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '54px',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      backgroundColor: digit ? '#f0f9ff' : '#f8fafc',
                      border: digit ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: digit ? '0 0 10px rgba(2, 132, 199, 0.25)' : 'none',
                      outline: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                cursor: (loading || otpDigits.join('').length < 6) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  <span>Validating OTP Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify OTP & Launch MRO Portal</span>
                </>
              )}
            </button>

            {/* Resend OTP & Back Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', color: '#64748b' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                ← Back to Login
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#94a3b8' : '#0284c7',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  fontWeight: 700
                }}
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
