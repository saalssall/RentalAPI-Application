import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import https from 'node:https';
import fs from 'node:fs';
import morgan from 'morgan';
import knex from 'knex';
import knexConfig from './knexfile.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/rentals-openapi.json' with { type: 'json' };

import userRouter from './routes/user.js';
import statesRouter from './routes/states.js';
import rentalsRouter from './routes/rentals.js';
import propertyTypesRouter from './routes/property-types.js';
import searchRouter from './routes/search.js';
import ratingRouter from './routes/rating.js';

const app = express();
const port = 3000;
const db = knex(knexConfig);

// Logging first
app.use(morgan('dev'));

// Core middleware
/* app.use(cors({
  origin: 'https://localhost:3000'
}));*/

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Attach db to every request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Docs
app.use('/docs', swaggerUI.serve);
app.get('/docs', swaggerUI.setup(swaggerDocument));

// Routes
app.get('/', (req, res) => res.send('Hello world'));
app.use('/user', userRouter);
app.use('/rentals/states', statesRouter);
app.use('/rentals/property-types', propertyTypesRouter);
app.use('/rentals/search', searchRouter);
app.use('/rentals', rentalsRouter);
app.use('/ratings', ratingRouter);

// HTTPS
const credentials = {
  key: fs.readFileSync('./certs/selfsigned.key'),
  cert: fs.readFileSync('./certs/selfsigned.crt'),
};

https.createServer(credentials, app).listen(port, () => {
  console.log(`Server listening on https://localhost:${port}`);
});