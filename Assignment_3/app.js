import 'dotenv/config';
import cors from 'cors';
import userRouter from './routes/user.js';
import express from 'express';
import knex from 'knex';
import knexConfig from './knexfile.js';
import apiRouter from './routes/api.js';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/rentals-openapi.json' with { type: 'json' };

const app = express();
const port = 3000;

morgan.token('res', (req, res) => {
    const headers = {};
    res.getHeaderNames().map(h => headers[h] = res.getHeader(h));
    return JSON.stringify(headers);
});

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

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});