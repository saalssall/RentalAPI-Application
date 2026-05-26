import express from 'express';
import authorisation from '../middleware/authorisation.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// =================== Helper Functions ===================

const getUserEmailFromToken = (authHeader) => {
    const token = authHeader.replace(/^Bearer /, "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.email;
};

const isValidComment = (comment) => {
    return typeof comment === "string" && comment.length >= 1 && comment.length <= 2000;
};

const buildRatingResponse = (rating, dateTime, comment) => {
    const response = { rating };
    if (comment !== undefined && comment !== null) response.comment = comment;
    response.dateTime = dateTime;
    return response;
};

const buildRatingItem = (r) => {
    const item = { rentalId: r.rentalId, rating: r.rating };
    if (r.comment !== null) item.comment = r.comment;
    item.dateTime = r.dateTime;
    return item;
};

const getRatingByUserAndRental = (db, rentalId, userEmail) => {
    return db.from("ratings").select("*")
        .where("rentalId", "=", rentalId)
        .where("userEmail", "=", userEmail);
};

const updateRating = (db, rentalId, userEmail, rating, comment, dateTime) => {
    return db.from("ratings")
        .where("rentalId", "=", rentalId)
        .where("userEmail", "=", userEmail)
        .update({ rating, comment: comment ?? null, dateTime });
};

const insertRating = (db, rentalId, userEmail, rating, comment, dateTime) => {
    return db.from("ratings")
        .insert({ rentalId, userEmail, rating, comment: comment ?? null, dateTime });
};

const checkRentalExists = (db, id) => {
    return db.from("data").select("*").where("id", "=", id);
};

const handleDbError = (res, err) => {
    console.log("DB Error:", err.message, err.code);
    res.status(500).json({ error: true, message: err.message });
};

// =================== Routes ===================

// POST /debugEraseRatings
router.post('/debugEraseRatings', (req, res, next) => {
    req.db.from("ratings").del()
        .then(() => {
            res.status(200).json({ message: "All ratings successfully erased." });
        })
        .catch(err => handleDbError(res, err));
});

// GET /ratings/rentals/:id - requires auth
router.get('/rentals/:id', authorisation, (req, res, next) => {
    const { id } = req.params;

    req.db.from("ratings")
        .select("rentalId", "rating", "comment", "dateTime")
        .where("rentalId", "=", id)
        .then(ratings => {
            if (ratings.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rating exists with this rental ID."
                });
                return;
            }

            // Remove comment field if null
            const response = ratings.map(r => buildRatingItem(r));
            res.status(200).json(response);
        })
        .catch(err => handleDbError(res, err));
});

// POST /ratings/rentals/:id - requires auth
router.post('/rentals/:id', authorisation, (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body ?? {};

    // 1. Validate comment only if provided
    if (comment !== undefined && !isValidComment(comment)) {
        res.status(400).json({
            error: true,
            message: "Invalid comment parameter. Comment must be a string 1-2000 characters long."
        });
        return;
    }

    // 2. Check rental exists
    checkRentalExists(req.db, id)
        .then(rows => {
            if (rows.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rental exists with this ID."
                });
                return;
            }

            // 3. Get user email from token
            const userEmail = getUserEmailFromToken(req.headers.authorization);
            const dateTime = new Date();

            // 4. Check if rating already exists for this user and rental
            return getRatingByUserAndRental(req.db, id, userEmail)
                .then(existing => {
                    // 4.1 Update or insert rating
                    const action = existing.length > 0
                        ? updateRating(req.db, id, userEmail, rating, comment, dateTime)
                        : insertRating(req.db, id, userEmail, rating, comment, dateTime);

                    return action.then(() => {
                        // 4.2 Return response - comment only included if provided
                        res.status(201).json(buildRatingResponse(rating, dateTime, comment));
                    });
                });
        })
        .catch(err => handleDbError(res, err));
});

export default router;