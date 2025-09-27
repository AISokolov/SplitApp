import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

import cashLogo from '../assets/images/cash.png';
import securityLogo from '../assets/images/cyber-security.png';
import meetingLogo from '../assets/images/meeting.png';
import doneLogo from '../assets/images/done.png';
import splitLogo from '../assets/images/logoTransparent.png'; 



function App() {
  const options = ['friends', 'roommates', 'family', 'colleagues', 'partners', 'teammates', 
    'housemates', 'classmates', 'neighbors', 'travel buddies', 
    'gaming friends', 'study group', 'bandmates'];
  const [index, setIndex] = useState(0);
  const [services, setServices] = useState([]); 
  const [showLogin, setShowLogin] = useState(false);
  const [showSingUp, setShowSingUp] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const advantages = [
    { 
      title: 'Easy Expense Splitting', 
      icon: cashLogo,
      desc: 'Quickly divide subscription costs among your group with just a few clicks.'
    },
    { 
      title: 'Track All Subscriptions', 
      icon: doneLogo,
      desc: 'See all your shared subscriptions in one organized dashboard. Stay in-sync'
    },
    { 
      title: 'Invite Friends Easily', 
      icon: meetingLogo,
      desc: 'Send invites and reminders to friends or family to join and pay their share.'
    },
    { 
      title: 'Secure & Private', 
      icon: securityLogo,
      desc: 'All your data is encrypted and will never shared with any of third parties.'
    },
];

   useEffect(() => {
    fetch('http://91.228.153.55:7777/subscriptions/types')
      .then(res => res.json())
      .then(data => {
        if (data.success !== false) {
          setServices(data);
        } else {
          console.error('Failed to fetch services:', data.message);
        }
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  async function handleLogin() {
    setLoginError('');
    try {
      const response = await fetch('http://91.228.153.55:7777/users/login', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUsername, 
          password: loginPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowLogin(false);
        navigate('/main');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server error');
    }
  }

  async function handleRegister() {
  setRegisterError('');
  setRegisterSuccess('');
  try {
        const response = await fetch('http://91.228.153.55:7777/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: registerUsername,
            email: registerEmail,
            password: registerPassword,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setRegisterSuccess('Registration successful! You can now log in.');
          setTimeout(() => {
            setShowSingUp(false);
            setRegisterUsername('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterSuccess('');
          }, 1500);
        } else {
          setRegisterError(data.message || 'Registration failed');
        }
      } catch (err) {
        setRegisterError('Server error');
      }
    }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [options.length]);


  return (
    <div className="main-page">
      <header className="main-header">
      <div className="header-left">
        <img src={splitLogo} alt="Split Logo" className="header-logo" />
      </div>
      <div className="header-buttons">
        <button className="auth-button" onClick={() => setShowLogin(true)}>Login</button>
        <button className="auth-button" onClick={() => setShowSingUp(true)}>Sign Up</button>
      </div>
    </header>

      <main className="main-content">
        <section>
          <h1 style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60px',
            textAlign: 'center',
            fontSize: '3rem',
            padding: '165px 0',
            margin: '32px 0'
          }}>
            Share your subscription expenses with <strong style={{color: '#004d99'}}> {options[index]} </strong>
          </h1>
        </section>
        <p style={{fontSize: '1.2rem'}}>
          Save on subscriptions by joining the co-subscription community.
        </p>
        <section className='advantages-box'>
        <div className="horizontal-flashcards">
          {advantages.map((adv, idx) => (
            <div key={idx} className="advantage-flashcard">
              {typeof adv.icon === 'string' && adv.icon.length === 1 ? (
                <span className="advantage-icon">{adv.icon}</span>
              ) : (
                <img src={adv.icon} alt={adv.title} className="advantage-icon" />
              )}
              <div>
                <span className="advantage-title">{adv.title}</span>
              </div>
              <div>
                <span className="advantage-desc">{adv.desc}</span>
              </div>
            </div>
          ))}
        </div>
        </section>
        <h2 className="landing-title">One app. All your subscriptions. Zero hassle.</h2>
       <section className="advantages-box">
          <h2>Supported Services</h2>
          <div className="services-scroll">
            {services.map((service, idx) => (
              <div key={idx} className="service-card">
                {service.icon_image && (
                  <img
                    src={service.icon_image}
                    alt={service.service_name}
                    className="service-icon"
                  />
                )}
                <div className="service-title">{service.service_name}</div>
                <div className="service-price">€{service.cost}/month</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-text">
        SYS III, FAMNIT 2025, Koper, Slovenia
      </footer>

    {showLogin && (
      <div className="login-modal">
        <div className="login-frame">
          <button className="close-button" onClick={() => setShowLogin(false)}>×</button>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
          />
          <button className="submit-button" onClick={handleLogin}>Log in</button>
          {loginError && <div style={{color: 'red'}}>{loginError}</div>}
        </div>
      </div>
  )}

      {showSingUp && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={() => setShowSingUp(false)}>×</button>
            <h2>Sign up</h2>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
            />
            <button className="submit-button" onClick={handleRegister}>Register</button>
            {registerError && <div style={{color: 'red'}}>{registerError}</div>}
            {registerSuccess && <div style={{color: 'green'}}>{registerSuccess}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;