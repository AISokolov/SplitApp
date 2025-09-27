import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const ProfilePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [manageService, setManageService] = useState(null);
  const [message, setMessage] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://91.228.153.55:7777/users/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmail(data.user.email || '');
          setPassword(data.user.password || '');
          setUsername(data.user.user_name || '');
        } else {
          alert(data.message);
        }
      });

    fetch('http://91.228.153.55:7777/subscriptions/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubscriptions(data.subscriptions);
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Failed to fetch subscriptions:', err));
  }, []);

  const handleSave = async () => {
    setMessage('');
    const res = await fetch('http://91.228.153.55:7777/users/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const unsubscribe = (typeId, serviceName) => {
    console.log('Unsubscribing from typeId:', typeId); // Debug log
    console.log('Unsubscribing from serviceName:', serviceName); // Debug log
    fetch('http://91.228.153.55:7777/subscriptions/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ typeId, serviceName }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Fetch the updated list of subscriptions
          fetch('http://91.228.153.55:7777/subscriptions/user', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log('Updated subscriptions:', data.subscriptions);
                setSubscriptions(data.subscriptions); // Update subscriptions state
                navigate('/profile'); // Redirect to profile page
                manageService && setManageService(null); // Close the manage service modal
              } else {
                alert(data.message);
              }
            })
            .catch(err => console.error('Failed to fetch updated subscriptions:', err));
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Failed to unsubscribe:', err));
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>My Profile</h1>
        <div className="header-buttons">
          <button
            className="auth-button"
            onClick={() => navigate('/main')}
          >
            Back
          </button>
          <button
            className="auth-button log-out-button"
            onClick={() => navigate('/')}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="profile-container">
        <form className="profile-form" onSubmit={e => e.preventDefault()}>
          <label>Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Enter new email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            className="login-input"
            type="text"
            placeholder="Enter new password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <label>Username</label>
          <input
            className="login-input"
            type="text"
            value={username}
            disabled
          />
          <button className="submit-button" type="button" onClick={handleSave}>
            Save Changes
          </button>
          {message && (
            <div style={{ color: message === "Profile updated" ? "green" : "red" }}>
              {message}
            </div>
          )}
        </form>
        <section style={{ width: '100%' }}>
          <h2 style={{ textAlign: 'center', color: '#0077cc' }}>My Subscriptions</h2>
          <div className="flashcards-container">
            {subscriptions.map((sub, idx) => (
              <div className="flashcard" key={idx}>
                <h2>{sub.service_name}</h2>
                <p>€{sub.cost}/month</p>
                <button
                  className="auth-button"
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
            <button className="close-button" onClick={() => setManageService(null)}>×</button>
            <h2>{manageService.service_name}</h2>
            <button
              className="submit-button unsubscribe-button"
              onClick={() => unsubscribe(manageService?.type_id, manageService?.service_name)} // Pass both typeId and serviceName
            >
              Unsubscribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;