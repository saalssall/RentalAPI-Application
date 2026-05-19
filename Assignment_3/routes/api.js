import express from 'express';
import authorisation from '../middleware/authorisation.js';
const router = express.Router();


router.get('/', function (req, res, next) {
  res.send("<h1>Rental Search API</h1>");
});

router.get("/data", (req, res, next) => {
  req.db
  .from("data")
  .select("state", "suburb")
  .then(rows => {
    res.json({ error: false, message: "Success", data: rows });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ error: true, message: "Error in MySQL query" });
  });
});


export default router;