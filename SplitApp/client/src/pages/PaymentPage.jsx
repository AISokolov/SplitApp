// ...existing code...
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import '../App.css';

const PaymentPage = () => {
  const [remember, setRemember] = React.useState(false);
  const navigate = useNavigate();

  const [cardHolder, setCardHolder] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [userId, setUserId] = React.useState(null);

  // new states
  const [savedPayment, setSavedPayment] = React.useState(null);
  const [showSavedHint, setShowSavedHint] = React.useState(false);

  const API_BASE = 'http://91.228.153.55:7777';
  const API_URL = `${API_BASE}/payments`;

  useEffect(() => {
    fetch(`${API_BASE}/users/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('no session');
        return res.json();
      })
      .then(data => {
        if (data && data.user_id) {
          setUserId(data.user_id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && data.saved) setSavedPayment(data.saved);
      })
      .catch(() => {});
  }, [userId]);

  const useSavedCard = () => {
    if (!savedPayment) return;
    setCardHolder(savedPayment.card_holder || '');
    setExpiryDate(savedPayment.card_expiry || '');
    setCardNumber((savedPayment.card_number_last4 || ''));
    setShowSavedHint(false);
  };

  const handleCardHolderFocus = () => {
    if (savedPayment) setShowSavedHint(true);
  };

  const handleCardHolderBlur = () => {
    setTimeout(() => setShowSavedHint(false), 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cardHolder || !cardNumber || !expiryDate || !cvv) {
      alert('Please fill in all payment details.');
      return;
    }

    const cardDigits = cardNumber.replace(/\D/g, '');
    if (cardDigits.length < 12) {
      alert('Enter a valid card number.');
      return;
    }

    const last4 = cardDigits.slice(-4);

    setLoading(true);
    try {
      const payload = {
        card_holder: cardHolder,
        card_number_last4: last4,
        card_expiry: expiryDate,
      };

      if (userId) payload.user_id = userId;

      if (remember) {
        const salt = bcrypt.genSaltSync(10);
        const hashed = bcrypt.hashSync(cardDigits, salt);
        payload.card_number = hashed;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('server error');
      }

      setCardNumber('');
      setCvv('');
      navigate('/main');
    } catch (err) {
      alert('Error: ' + (err.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>Payment Details</h1>
      </header>
      <main className="payment-container">
        <form className="payment-form" onSubmit={handleSubmit}>
          <label htmlFor="card-holder">Card Holder</label>
          <input
            id="card-holder"
            className="login-input"
            value={cardHolder}
            onChange={e => setCardHolder(e.target.value)}
            onFocus={handleCardHolderFocus}
            onBlur={handleCardHolderBlur}
            placeholder="Full name"
          />
          {showSavedHint && savedPayment && (
            <div style={{ marginTop: 6 }}>
              <button type="submit" onClick={useSavedCard} style={{ cursor: 'pointer' }}>
                Use saved card: {savedPayment.card_holder} ...{savedPayment.card_number_last4}
              </button>
            </div>
          )}

          <label htmlFor="card-number">Card Number</label>
          <input
            type="text"
            id="card-number"
            className="login-input"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
          />

          <label htmlFor="expiry-date">Expiry Date</label>
          <input
            type="text"
            id="expiry-date"
            className="login-input"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
          />

          <label htmlFor="cvv">CVV</label>
          <input
            type="password"
            id="cvv"
            className="login-input"
            value={cvv}
            onChange={e => setCvv(e.target.value)}
            placeholder="123"
          />

          <label className="remember-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ margin: 0 }}
            />
            Remember my payment method (store card in DB)
          </label>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing...' : 'Pay'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PaymentPage;