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

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
