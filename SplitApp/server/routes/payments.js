const express = require('express');
const payments = express.Router();
const DB = require('../db/dbConn.js');

payments.post('/', async (req, res) => {
  const { card_holder, card_number_last4, card_number, card_expiry, user_id } = req.body;

  if (!card_holder || !card_number_last4 || !card_expiry) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const uid = (req.session && req.session.userId) || user_id || null;

  try {
    const result = await DB.savePayment(uid, card_holder, card_number_last4, card_number, card_expiry);
    return res.json({ message: 'Payment saved', payment_id: result.insertId || null });
  } catch (err) {
    console.error('DB insert error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

payments.get('/me', async (req, res) => {
  const userId = req.session && req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const rows = await DB.getSavedPayment(userId);
    if (rows && rows.length > 0) {
      return res.json({ saved: rows[0] });
    }
    return res.json({ saved: null });
  } catch (err) {
    console.error('Error fetching saved payment:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = payments;