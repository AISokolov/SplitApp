import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const dummySubscriptions = [
  { name: 'Spotify', price: '€4.00/month' },
  { name: 'YouTube Premium', price: '€5.50/month' },
];

const ProfilePage = () => {
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [manageService, setManageService] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>My Profile</h1>
        <button
          className="auth-button"
          style={{ right: 40, top: 20 }}
          onClick={() => navigate('/main')}
        >
          Back
        </button>
        <button
          className="auth-button"
          style={{ right: 40, top: 20, backgroundColor: '#ff4d4f', color: 'white' }}
          onClick={() => navigate('/')}
        >
          Log out
        </button>
      </header>
      <main className="profile-container">
        <form className="profile-form">
          <label>Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Enter new email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label>Address</label>
          <input
            className="login-input"
            type="text"
            placeholder="Enter new address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <label>Username</label>
          <input
            className="login-input"
            type="text"
            placeholder="Enter new username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button className="submit-button" type="button">Save Changes</button>
        </form>
        <section style={{width: '100%'}}>
          <h2 style={{textAlign: 'center', color: '#0077cc'}}>My Subscriptions</h2>
          <div className="flashcards-container">
            {dummySubscriptions.map((sub, idx) => (
              <div className="flashcard" key={idx}>
                <h2>{sub.name}</h2>
                <p>{sub.price}</p>
                <button
                  className="submit-button"
                  type="button"
                  onClick={() => setManageService(sub)}
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {manageService && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={() => setManageService(null)}>
              ×
            </button>
            <h2>{manageService.name}</h2>
            <button className="submit-button" style={{backgroundColor: '#ff4d4f'}} type="button">
              Unsubscribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;