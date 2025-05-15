import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

// Example logo imports (update the paths to your actual images)
import spotifyLogo from '../assets/images/spotify.png';
import youtubeLogo from '../assets/images/youtube.png';
import appleLogo from '../assets/images/applemusic.png';


function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSingUp, setShowSingUp] = useState(false);
  const navigate = useNavigate();

  const services = [
    { name: 'Spotify', logo: spotifyLogo },
    { name: 'YouTube Premium', logo: youtubeLogo },
    { name: 'Apple Music', logo: appleLogo },
  ];

  const advantages = [
    { title: 'Easy Expense Splitting', icon: '💸' },
    { title: 'Track All Subscriptions', icon: '📋' },
    { title: 'Invite Friends Easily', icon: '🤝' },
    { title: 'Secure & Private', icon: '🔒' },
  ];


  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-buttons">
          <button className="auth-button" onClick={() => setShowLogin(true)}>Login</button>
          <button className="auth-button" onClick={() => setShowSingUp(true)}>Sign Up</button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="landing-title">Welcome to Split</h1>
          <p style={{ fontStyle: 'italic', color: '#0077cc', marginTop: '10px' }}>
            "One app. All your subscriptions. Zero hassle."
          </p>
        <section className="about-section">
          <p>
            Split is your all-in-one solution for managing and sharing subscription expenses with friends, roommates, or family.<br />
            <strong>Track your subscriptions, split costs, and never miss a payment again!</strong>
          </p>
        </section>
        <section className="supported-services-section">
          <h2>Advantages</h2>
          <div className="horizontal-flashcards">
            {advantages.map((adv, idx) => (
              <div key={idx} className="flashcard horizontal-flashcard">
                <span style={{ fontSize: 32, marginRight: 12 }}>{adv.icon}</span>
                <span style={{ fontWeight: 500 }}>{adv.title}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="supported-services-section">
          <h2>Supported Services</h2>
          <div className="horizontal-flashcards">
            {services.map((service, idx) => (
              <div key={idx} className="flashcard horizontal-flashcard">
                <img src={service.logo} alt={service.name + " logo"} className="service-logo" />
                <span style={{ fontWeight: 500 }}>{service.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-text">
        SYS III, FAMNIT 2023, Koper, Slovenia
      </footer>

      {showLogin && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={() => setShowLogin(false)}>×</button>
            <h2>Login</h2>
            <input type="email" placeholder="Email" className="login-input" />
            <input type="password" placeholder="Password" className="login-input" />
            <button className="submit-button" onClick={() => navigate('/main')}>Log in</button>
          </div>
        </div>
      )}

      {showSingUp && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={() => setShowSingUp(false)}>×</button>
            <h2>Sign up</h2>
            <input type="email" placeholder="Email" className="login-input" />
            <input type="username" placeholder="Username" className="login-input" />
            <input type="password" placeholder="Password" className="login-input" />
            <button className="submit-button" onClick={() => navigate('/main')}>Register</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;