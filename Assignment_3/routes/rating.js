import express from 'express';
import authorisation from '../middleware/authorisation.js';
const router = express.Router();

router.post('/debugEraseRatings', (req, res, next) => {
    req.db.from("ratings").del()
        .then(() => {
            res.status(200).json({ message: "All ratings erased" });
        })
        .catch(err => {
            console.log("Full error:", err);  // ← this will show the full error
            res.status(500).json({ error: true, message: err.message });
        });
});
export default router;