import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function MainPage() {
  const services = [
    { name: 'Spotify', price: '€4.00/month' },
    { name: 'YouTube Premium', price: '€5.50/month' },
    { name: 'Apple Music', price: '€3.96/month' },
  ];

  const [selectedService, setSelectedService] = useState(null); // Track the selected service

  const closeModal = () => {
    setSelectedService(null); // Close the modal
  };

  const navigate = useNavigate();

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>Available Subscriptions</h1>
        <button className="auth-button" onClick={() => navigate('/profile')}>My Profile</button>
      </header>
      <main className="flashcards-container">
        {services.map((service, index) => (
          <div
            key={index}
            className="flashcard"
            onClick={() => setSelectedService(service)} // Open modal on click
          >
            <h2>{service.name}</h2>
            <p>{service.price}</p>
          </div>
        ))}
      </main>

      {selectedService && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            <h2>{selectedService.name}</h2>
            <p>{selectedService.price}</p>
            <button className="submit-button" onClick={() => navigate('/payment')}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;