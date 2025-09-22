import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Root from './pages/root';
import MainPage from './pages/MainPage';
import Payment from './pages/PaymentPage';
import PrifilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<PrifilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
