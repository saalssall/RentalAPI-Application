import express from 'express';
import authorisation from '../middleware/authorisation.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/debugEraseRatings', (req, res, next) => {
    req.db.from("ratings").del()
        .then(() => {
            res.status(200).json({ message: "All ratings successfully erased." });
        })
        .catch(err => {
            console.log("Full error:", err);  // ← this will show the full error
            res.status(500).json({ error: true, message: err.message });
        });
});

// GET /ratings/rentals/:id - requires auth
router.get('/rentals/:id', authorisation, (req, res, next) => {
    const { id } = req.params;

    // Check if rating exists for this rental
    req.db.from("ratings").select("*").where("rentalId", "=", id)
        .then(ratings => {
            if (ratings.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rating exists with this rental ID."
                });
                return;
            }
            res.status(200).json(ratings);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});

// POST /ratings/rentals/:id - requires auth
router.post('/rentals/:id', authorisation, (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body ?? {};

    // 1. Validate comment if provided
    if (comment !== undefined && (typeof comment !== "string" || comment.length < 1 || comment.length > 2000)) {
        res.status(400).json({
            error: true,
            message: "Invalid comment parameter. Comment must be a string 1-2000 characters long."
        });
        return;
    }

    // 2. Check rental exists
    req.db.from("data").select("*").where("id", "=", id)
        .then(rows => {
            if (rows.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rental exists with this ID."
                });
                return;
            }

            // 3. Get user email from token
            const token = req.headers.authorization.replace(/^Bearer /, "");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.email;
            const dateTime = new Date();

            // 4. Check if rating already exists for this user and rental
            return req.db.from("ratings").select("*")
                .where("rentalId", "=", id)
                .where("userEmail", "=", userEmail)
                .then(existing => {
                    if (existing.length > 0) {
                        // 4.1 Update existing rating
                        return req.db.from("ratings")
                            .where("rentalId", "=", id)
                            .where("userEmail", "=", userEmail)
                            .update({ rating, comment: comment || null, dateTime })
                            .then(() => {
                                const response = { rating, dateTime };
                                if (comment) response.comment = comment;
                                res.status(201).json(response);
                            });
                    } else {
                        // 4.2 Insert new rating
                        return req.db.from("ratings")
                            .insert({ rentalId: id, userEmail, rating, comment: comment || null, dateTime })
                            .then(() => {
                                const response = { rating, dateTime };
                                if (comment) response.comment = comment;
                                res.status(201).json(response);
                            });
                    }
                });
        })
        .catch(err => {
    console.log("FULL ERROR:", err.message, err.code, err.sqlMessage);
    res.status(500).json({ error: true, message: err.message });
        });
});

export default router;