"use client";

import React from 'react';

interface StarsBackgroundProps {
  children: React.ReactNode;
  starColor?: string;
}

export default function StarsBackground({
  children,
  starColor = '#0099ff'
}: StarsBackgroundProps) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ANIMATED STARS BACKGROUND */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }

        .star {
          position: absolute;
          background: ${starColor};
          border-radius: 50%;
          animation: float linear infinite;
          box-shadow: 0 0 8px rgba(0, 153, 255, 0.6);
        }

        .star-1 { width: 2px; height: 2px; top: 10%; left: 10%; animation-duration: 8s; }
        .star-2 { width: 1px; height: 1px; top: 20%; left: 80%; animation-duration: 10s; }
        .star-3 { width: 1.5px; height: 1.5px; top: 30%; left: 30%; animation-duration: 12s; }
        .star-4 { width: 2px; height: 2px; top: 40%; left: 70%; animation-duration: 9s; }
        .star-5 { width: 1px; height: 1px; top: 50%; left: 20%; animation-duration: 11s; }
        .star-6 { width: 1.5px; height: 1.5px; top: 60%; left: 85%; animation-duration: 13s; }
        .star-7 { width: 2px; height: 2px; top: 70%; left: 40%; animation-duration: 10s; }
        .star-8 { width: 1px; height: 1px; top: 80%; left: 75%; animation-duration: 12s; }
        .star-9 { width: 1.5px; height: 1.5px; top: 15%; left: 50%; animation-duration: 14s; }
        .star-10 { width: 2px; height: 2px; top: 35%; left: 15%; animation-duration: 11s; }
        .star-11 { width: 1px; height: 1px; top: 55%; left: 60%; animation-duration: 9s; }
        .star-12 { width: 1.5px; height: 1.5px; top: 75%; left: 25%; animation-duration: 13s; }
      `}</style>

      {/* STARS LAYER */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`star star-${i + 1}`} />
        ))}
      </div>

      {/* CONTENT - WRAP WITH HIGHER Z-INDEX */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
}
