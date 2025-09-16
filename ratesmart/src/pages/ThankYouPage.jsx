import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ThankYouPage.css';

const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <h1>🎉 Thank You!</h1>
        <p>Your review has been submitted successfully.</p>
        <button onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    </div>
  );
};

export default ThankYouPage;