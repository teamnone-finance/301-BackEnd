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
app.get('/stockinfo', getStockInfo);////////////////<---- NEW
app.get('/stockdescription', getStockDescription);////////////////<---- NEW
app.get('/portfolio/:portfolio_id', getUniquePortfolio);
app.post('/portfolio', createPortfolio);
app.post('/portfolio/edit=:portfolio_id', editPortfolio);
app.post('/portfolio/delete=:portfolio_id', deletePortfolio);

//middleman APIs
app.get('/get-stocks-chart', getStockChartRapid);
app.get('/get-company', getCompanyName);
app.get('/get-quote', getCompanyQuote);

app.post('/stocks', createStock);


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
  const url = `https://investors-exchange-iex-trading.p.rapidapi.com/stock/${request.query.symbol}/company`;
  rapidAPIRetrieval(url, response);
}

function rapidAPIRetrieval(url, response) {
  return superagent(url)
    .set('X-RapidAPI-Host', 'investors-exchange-iex-trading.p.rapidapi.com')
    .set('X-RapidAPI-Key', process.env.RAPID_API_KEY)
    .then(result => response.send(result.body))
    .catch(err => console.log(err));
}

function getStockInfo(request, response){
  console.log(request.query);
  const symbol = request.query.symbol;
  const rapidGET = 'https://investors-exchange-iex-trading.p.rapidapi.com/stock/';

  superagent(`${rapidGET}/${symbol}/quote`)
    .set('X-RapidAPI-Host', process.env.X_RapidAPI_Host)
    .set('X-RapidAPI-Key', process.env.X_RapidAPI_Key)
    .then(result => {
      console.log('Result.body of stock quote superagent: ',result.body);
      let output = {
        nowPrice: result.body.latestPrice,
        opening: result.body.open,
        yrHigh: result.body.week52High,
        yrLow: result.body.week52Low,
        mktCap: result.body.marketCap,
        penRatio: result.body.penRatio,
        volume: result.body.avgTotalVolume,
        volumeToday: result.body.latestVolume
      };

      response.send(output);
    }).catch(err => console.log('Error in get Stock Info GET: ',err));

}

function getStockDescription(request, response){
  console.log(request.query);
  const symbol = request.query.symbol;
  const rapidGET = 'https://investors-exchange-iex-trading.p.rapidapi.com/stock/';

  superagent(`${rapidGET}/${symbol}/company`)
    .set('X-RapidAPI-Host', process.env.X_RapidAPI_Host)
    .set('X-RapidAPI-Key', process.env.X_RapidAPI_Key)
    .then(result => {
      console.log('Result.body of stock description superagent: ',result.body);
      response.send(result.body.description);
    }).catch(err => console.log('Error in get Stock Info GET: ',err));

}



// CR for user table
function createUser(request, response) {
  console.log('REQUEST FROM POST: ', request);
  userDbQuery(request.query.username).then(result => {
    console.log('USERNAME FROM POST: ', request.query.username);
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
  console.log('USERNAME FROM GET: ',username);
  const SQL = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return client.query(SQL, values).catch((err) => console.log('Error cath on query', err));
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
