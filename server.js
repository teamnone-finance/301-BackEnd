'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
client.on('error', err => console.error(err));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (request, response) => {
  response.status(200).send('Connected!');
});

app.get('/get-symbol', getSymbol);


// Database Operations

app.get('/user', getUser);
app.post('/user', createUser);

app.get('/portfolio', getAllPortfolio);
app.get('/portfolio/:portfolio_id', getUniquePortfolio);
app.post('/portfolio', createPortfolio);
app.post('/portfolio/edit=:portfolio_id', editPortfolio);
app.post('/portfolio/delete=:portfolio_id', deletePortfolio);


//API call to alphavantage
function getSymbol(request, response) {
  const alphaGet = 'https://www.alphavantage.co/query';
  return superagent(alphaGet)
    .query(
      {
        function: 'TIME_SERIES_WEEKLY',
        symbol: request.query.data,
        apikey: process.env.ALPHA_API_KEY
      })
    .then(result => {
      response.send(result.body);
    });
}


// CR for user table
function createUser(request, response) {
  userDbQuery(request.query.data).then(result => {
    if (result.rowCount === 0) {
      const SQL = `INSERT INTO users (username) VALUES ($1)`;
      const values = [request.query.data];
      return client.query(SQL, values)
        .then(result => response.send(result));
    }
  });
}

function getUser(request, response) {
  userDbQuery(request.query.data).then(result=> {
    response.send(result);
  });
}

function userDbQuery(username) {
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return client.query(SQL, values);
}


// CRUD for portfolio
function getAllPortfolio(request, response) {
  const SQL = `SELECT * FROM portfolio WHERE portfolio.user_id = $1;`;
  const values = [request.query.data];
  return client.query(SQL, values).then(result => {
    response.send(result);
  });

}

function getUniquePortfolio(request, response) {

}

function createPortfolio(request, response) {
  
}

function editPortfolio(request, response) {
  
}

function deletePortfolio(request, response) {
  
}

function userDbQuery(username) {
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return client.query(SQL, values);
}


app.listen(PORT, () => console.log(`Listening on ${PORT}`));
