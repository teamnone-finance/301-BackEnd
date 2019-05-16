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

app.get('/stock', getStockSingle);
app.get('/stocks', getStocks);
app.post('/stocks', createStock);
app.delete('/stocks', deleteStock);

//middleman APIs
app.get('/get-stocks-chart', getStockChartRapid);
app.get('/get-company', getCompanyName);
app.get('/get-quote', getCompanyQuote);

//API call to Rapid
function getStockChartRapid(request, response) {
  const url = `https://investors-exchange-iex-trading.p.rapidapi.com/stock/${request.query.symbol}/chart/${request.query.time}`;
  rapidAPIRetrieval(url, response);
}

function getCompanyQuote(request, response) {
  const url = `https://investors-exchange-iex-trading.p.rapidapi.com/stock/${request.query.symbol}/quote`;
  rapidAPIRetrieval(url, response);
}

function getCompanyName(request, response) {
  // console.log('----inside company name -----');
  const url = `https://investors-exchange-iex-trading.p.rapidapi.com/stock/${request.query.symbol}/company`;
  rapidAPIRetrieval(url, response);
}

function rapidAPIRetrieval(url, response) {
  return superagent(url)
    .set('X-RapidAPI-Host', 'investors-exchange-iex-trading.p.rapidapi.com')
    .set('X-RapidAPI-Key', process.env.X_RapidAPI_Key)
    .then(result => {
      // console.log(result);
      response.send(result.body);
    })
    .catch(err => console.log(err));
}

// CRUD for user table
function createUser(request, response) {
  console.log('inside creatUser--------');
  userDbQuery(request.query.username).then(result => {
    if (result.rowCount === 0) {
      const SQL = `INSERT INTO users (username) VALUES ($1)`;
      const values = [request.query.username];
      return client.query(SQL, values)
        .then(result => {
          console.log('Insert Users Results:', result);
          response.send(result);
        });
    } else {
      response.send(`Username ${request.query.username} already exists in the database`);
    }
  })
    .catch(err => handleError(err, response));
}

function getUser(request, response) {
  userDbQuery(request.query.username)
    .then(result => {
      console.log('userDbQuery result is: ',result);
      response.send(result);
    })
    .catch(err => handleError(err, response));
}

function userDbQuery(username) {
  console.log('USERNAME FROM GET: ',username);
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return client.query(SQL, values);
}

// CRUD for STOCK
function getStockSingle(request, response) {
  stockDbQuery(request.query.username, request.query.symbol)
    .then(result => response.send(result))
    .catch(err => handleError(err, response));
}

function getStocks(request, response) {
  const SQL = `SELECT * FROM stocks WHERE stocks.user_id = $1`;
  const values = [request.query.username];
  return client.query(SQL, values)
    .then(result => response.send(result))
    .catch(err => handleError(err, response));
}
function createStock(request, response) {
  stockDbQuery(request.query.username, request.query.symbol)
    .then(results => {
      if (results.rowCount === 0) {
        const SQL = `INSERT INTO stocks (symbol, user_id) VALUES ($1, $2)`;
        const values = [request.query.symbol, request.query.username];
        return client.query(SQL, values).then(result => response.send(result));
      } else {
        response.send(`${request.query.symbol} for ${request.query.username} already exists in the database`);
      }
    })
    .catch(err => handleError(err, response));
}

function deleteStock(request, response) {
  const SQL = `DELETE FROM stocks WHERE stocks.symbol = $1 AND stocks.user_id = $2`;
  const values = [request.query.symbol, request.query.username];
  return client.query(SQL, values)
    .then(result => response.send(result))
    .catch(err => handleError(err, response));
}

function stockDbQuery(username, symbol) {
  const SQL = `SELECT * FROM stocks WHERE stocks.user_id = $1 and stocks.symbol = $2`;
  const values = [username, symbol];
  return client.query(SQL, values);
}

function handleError(error, response) {
  response.status(500).send(`Something went wrong - ${error}`);
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
