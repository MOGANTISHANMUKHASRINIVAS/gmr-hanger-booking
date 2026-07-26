import React, { useEffect } from 'react';
import { Plane } from 'lucide-react';

const FlightTransitionOverlay = ({ isTransitioning, onTransitionComplete }) => {
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, 700); // 700ms smooth aerodynamic flight transition

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, onTransitionComplete]);

  if (!isTransitioning) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(8, 19, 38, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'all'
      }}
    >
      <style>{`
        @keyframes flightTakeoff {
          0% {
            transform: translate(-140px, 140px) scale(0.6) rotate(35deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate(140px, -140px) scale(1.2) rotate(35deg);
            opacity: 0;
          }
        }

        @keyframes jetStreamPulse {
          0% {
            width: 0px;
            opacity: 0;
          }
          50% {
            width: 180px;
            opacity: 0.95;
          }
          100% {
            width: 320px;
            opacity: 0;
          }
        }

        @keyframes sonarRingExpand {
          0% {
            width: 40px;
            height: 40px;
            opacity: 0.8;
            border-color: #38bdf8;
          }
          100% {
            width: 220px;
            height: 220px;
            opacity: 0;
            border-color: #0284c7;
          }
        }

        @keyframes cloudStreak {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(-100vw);
            opacity: 0;
          }
        }
      `}</style>

      {/* Atmospheric Cloud & Runway Speed Lines */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '30%',
            left: 0,
            width: '200px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent)',
            animation: 'cloudStreak 0.6s linear infinite'
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            width: '350px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.5), transparent)',
            animation: 'cloudStreak 0.5s linear infinite 0.15s'
          }} 
        />
      </div>

      {/* Center Radar Sonic Rings */}
      <div 
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: '2px solid #38bdf8',
            animation: 'sonarRingExpand 0.7s ease-out infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: '2px solid #0284c7',
            animation: 'sonarRingExpand 0.7s ease-out infinite 0.35s'
          }}
        />
      </div>

      {/* Aeroplane Takeoff Motion */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'flightTakeoff 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards'
        }}
      >
        {/* Jet Exhaust Vapor Trail Stream */}
        <div 
          style={{
            position: 'absolute',
            right: '40px',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(270deg, #38bdf8 0%, rgba(2, 132, 199, 0.8) 40%, rgba(56, 189, 248, 0) 100%)',
            boxShadow: '0 0 20px #38bdf8, 0 0 40px #0284c7',
            transformOrigin: 'right center',
            transform: 'rotate(-35deg)',
            animation: 'jetStreamPulse 0.7s ease-out forwards'
          }}
        />

        {/* Photorealistic Jet Aeroplane Icon */}
        <div 
          style={{
            position: 'relative',
            zIndex: 10,
            filter: 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.9)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6))',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Plane size={72} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
};

export default FlightTransitionOverlay;
