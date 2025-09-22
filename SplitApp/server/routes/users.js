const express = require("express");
const users = express.Router();
const DB = require('../db/dbConn.js');

users.get("/login",(req,res)=>{
    res.send("hola")
    })

users.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        try {
            let queryResult = await DB.AuthUser(username, password);
            if (queryResult.length > 0) {
                if (password === queryResult[0].password) {
                    req.session.logged_in = true;
                    req.session.user_name = queryResult[0].user_name;
                    req.session.password = queryResult[0].password;
                    req.session.userId = queryResult[0].u_id;
                    return res.json({ success: true, message: "LOGIN OK" });
                } else {
                    return res.json({ success: false, message: "Incorrect password" });
                }
            } else {
                return res.json({ success: false, message: "User not found" });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Server error" });
        }
    } else {
        return res.json({ success: false, message: "Missing username or password" });
    }
});

users.post('/register', async (req, res) => {
    const { user_name, email, password } = req.body;
    if (user_name && email && password) {
        try {
            // Check if user already exists
            let existing = await DB.AuthUser(user_name, password);
            if (existing.length > 0) {
                return res.json({ success: false, message: "User already exists" });
            }
            // Insert new user
            await DB.RegisterUser(user_name, email, password);
            return res.json({ success: true, message: "Registration successful" });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Server error" });
        }
    } else {
        return res.json({ success: false, message: "Missing Username, Email, or Password" });
    }
});

// routes/users.js
users.get('/profile', async (req, res) => {
  if (!req.session.user_name) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  try {
    const result = await DB.GetUserProfile(req.session.user_name);
    if (result.length > 0) {
      res.json({ success: true, user: result[0] });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

users.post('/profile/update', async (req, res) => {
  if (!req.session.user_name) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  const { email, password} = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }
  try {
    await DB.UpdateUserProfile(req.session.user_name, email, password);
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = users;