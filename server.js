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
// Database Operations

app.get('/user', getUser);
app.post('/user', createUser);

app.get('/portfolio', getAllPortfolio);
app.get('/portfolio/:portfolio_id', getUniquePortfolio);
app.post('/portfolio', createPortfolio);
app.post('/portfolio/edit=:portfolio_id', editPortfolio);
app.post('/portfolio/delete=:portfolio_id', deletePortfolio);


//ALPHAVANTAGE API Calls
app.get('/get-stocks-intraday', getStock);
app.get('/get-stocks-monthly', getStockLong);
app.get('/get-stocks-quote', getStockName);
app.get('/get-stocks-summary', getStockReport);

app.post('/stocks', createStock);


//API call to alphavantage
function getStock(request, response) {
  const alphaGet = 'https://www.alphavantage.co/query';
  return superagent(alphaGet)
    .query(
      {
        function: 'TIME_SERIES_INTRADAY',
        symbol: request.query.symbol,
        interval: '5min',
        apikey: process.env.ALPHA_API_KEY
      })
    .then(result => response.send(result.body));
}

function getStockLong(request, response) {
  const alphaGet = 'https://www.alphavantage.co/query';
  return superagent(alphaGet)
    .query(
      {
        function: 'TIME_SERIES_MONTHLY',
        symbol: request.query.symbol,
        interval: '5min',
        apikey: process.env.ALPHA_API_KEY
      })
    .then(result => response.send(result.body));

}

function getStockReport(request, response) {
  const alphaGet = 'https://www.alphavantage.co/query';
  return superagent(alphaGet)
    .query(
      {
        function: 'GLOBAL_QUOTE',
        symbol: request.query.symbol,
        apikey: process.env.ALPHA_API_KEY
      }
    )
    .then(result => response.send(result.body));
}

function getStockName(request, response) {
  const alphaGet = 'https://www.alphavantage.co/query';
  return superagent(alphaGet)
    .query(
      {
        function: 'SYMBOL_SEARCH',
        keywords: request.query.symbol,
        apikey: process.env.ALPHA_API_KEY
      }
    )
    .then(result => response.send(result.body));
}

// CR for user table
function createUser(request, response) {
  console.log('REQUEST FROM POST: ',request);
  userDbQuery(request.query.username).then(result => {
    console.log('USERNAME FROM POST: ',request.query.username);
    if (result.rowCount === 0) {
      const SQL = `INSERT INTO users (username) VALUES ($1)`;
      const values = [request.query.username];
      return client.query(SQL, values)
        .then(result => response.send(result))
        .catch(err => console.log('error on create user sql: ', err));
    }
  });
}

function getUser(request, response) {
  userDbQuery(request.query.username).then(result => {
    response.send(result);
  });
}

function userDbQuery(username) {
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return client.query(SQL, values).catch((err)=>console.log('Error cath on query',err));
}


// CRUD for portfolio
function getAllPortfolio(request, response) {
  const SQL = `SELECT * FROM portfolio WHERE portfolio.user_id = $1;`;
  const values = [request.query.user_id];
  return client.query(SQL, values).then(result => {
    response.send(result);
  });

}

function getUniquePortfolio(request, response) {
  const SQL = `SELECT * FROM portfolio WHERE portfolio.user_id = $1 AND portfolio.id = $2`;
  const values = [request.query.user_id, request.params.portfolio_id];
  return client.query(SQL, values).then(result => {
    response.send(result);
  });
}

function createPortfolio(request, response) {
  const SQL = `INSERT INTO portfolio (portfolio_name, description, user_id) VALUES ($1, $2, $3)`;
  const values = [request.query.portfolio_name, request.query.description, request.query.username];
  return client.query(SQL, values).then(result => response.send(result));
}

function editPortfolio(request, response) {
  let SQL = `  UPDATE portfolio SET(portfolio_name, description) = ($1, $2) WHERE portfolio.id = $3 AND portfolio.user_id = $4;`;
  const values = [request.query.portfolio_name, request.query.description, request.params.portfolio_id, request.query.user_id];
  return client.query(SQL, values).then(result => response.send(result));
}

function deletePortfolio(request, response) {
  const SQL = `DELETE FROM portfolio WHERE portfolio.id = $1 AND portfolio.user_id = $2`;
  const values = [request.params.portfolio_id, request.query.user_id];
  return client.query(SQL, values).then(result => response.send(result));
}

// CRUD for STOCK

function createStock(request, response) {
  const SQL = `INSERT INTO stocks (stock_symbol, portfolio_id) VALUES($1, $2)`;
  const values = [request.query.stock, request.query.portfolio_id];
  return client.query(SQL, values).then(result => response.send(result));
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
