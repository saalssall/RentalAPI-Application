import express from 'express';
import morgan from 'morgan';
import authorisation from '../middleware/authorisation.js';
const router = express.Router();


router.get('/', function (req, res, next) {
  res.send("<h1>Rental Search API</h1>");
});

morgan.token('res', (req, res) => {
    const headers = {};
    res.getHeaderNames().map(h => headers[h] = res.getHeader(h));
    return JSON.stringify(headers);
});

export default router;