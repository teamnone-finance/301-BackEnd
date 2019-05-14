
DROP TABLE IF EXISTS users, portfolio, stocks;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  portfolio_name VARCHAR(255),
  description TEXT,
  user_id VARCHAR(255) NOT NULL REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  stock_symbol VARCHAR(255),
  stock_name VARCHAR(255),
  portfolio_id INTEGER NOT NULL REFERENCES portfolio(id)
);