import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const PaymentPage = () => {
  const [remember, setRemember] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>Payment Details</h1>
      </header>
      <main className="payment-container">
        <form className="payment-form">
          <label htmlFor="card-number">Card Number</label>
          <input type="text" id="card-number" className="login-input" placeholder="1234 5678 9012 3456" />

          <label htmlFor="expiry-date">Expiry Date</label>
          <input type="text" id="expiry-date" className="login-input" placeholder="MM/YY" />

          <label htmlFor="cvv">CVV</label>
          <input type="text" id="cvv" className="login-input" placeholder="123" />

          <label className="remember-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{margin: 0}}
            />
            Remember my payment method
          </label>

          <button type="submit" className="auth-button" onClick={() => navigate('/main')}>Pay</button>
        </form>
      </main>
    </div>
  );
};

export default PaymentPage;