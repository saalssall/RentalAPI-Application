import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import https from 'node:https';
import fs from 'node:fs';

import userRouter from './routes/user.js';
import statesRouter from './routes/states.js';
import rentalsRouter from './routes/rentals.js';
import apiRouter from './routes/api.js';
import propertyTypesRouter from './routes/property-types.js';

import knex from 'knex';
import knexConfig from './knexfile.js';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/rentals-openapi.json' with { type: 'json' };

const app = express();
const port = 3000;

const db = knex(knexConfig);

// Attach db to req once
app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/docs', swaggerUI.serve);
app.get('/docs', swaggerUI.setup(swaggerDocument));

app.use('/api', apiRouter);
app.use('/user', userRouter);
app.use('/rentals/states', statesRouter);
app.use('/rentals/property-types', propertyTypesRouter);
app.use('/rentals', rentalsRouter);

// to be removed later, just to test the connection
app.get("/knex", (req, res, next) => {
    req.db.raw("SELECT VERSION()")
        .then(version => {
            console.log(version[0][0]);
            res.send("Version logged successfully");
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
});

app.get('/', (req, res) => {
    res.send('Hello world');
});

const credentials = {
    key: fs.readFileSync('./certs/selfsigned.key'),
    cert: fs.readFileSync('./certs/selfsigned.crt')
}

https.createServer(credentials, app).listen(port, () => {
    console.log(`Server listening on https://localhost:${port}`);
});