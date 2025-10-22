// src/views/Splash.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splashImg from '../assets/images/splash.png';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img src={splashImg} alt="Splash" className="splash-bg" />
      <div className="splash-text">
        <h1>
          <span className="splash-title">Flog</span>
          <br />
          <span className="splash-subtitle">Start Your Recipe Share Today!</span>
        </h1>
      </div>
    </div>
  );
}
