const express = require('express')
const users = require("./routes/users")
const subscriptions = require('./routes/subscriptions');
const payments = require('./routes/payments');
require('dotenv').config()
const DB = require('./db/dbConn.js')
const cors = require('cors')
const path = require('path')
const port = 7777
const app = express()

const session = require('express-session')

//const BASE_IP = 'http://88.200.63.148:7778'
const BASE_IP = 'http://91.228.153.55:7778'

app.use(session({
  secret: 'some secret', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.urlencoded({extended : true}));
app.use(cors({
   origin: BASE_IP,
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
   credentials: true
}))

app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`)
})

app.use(express.json());


app.use('/users', users);
app.use('/subscriptions', subscriptions);
app.use('/payments', payments);