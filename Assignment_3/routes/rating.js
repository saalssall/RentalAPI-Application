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
            console.log("Full error:", err);
            res.status(500).json({ error: true, message: err.message });
        });
});

// GET /ratings - requires auth
router.get('/', authorisation, (req, res, next) => {
    const userEmail = req.user.email;

    if (req.query.page !== undefined && (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 1)) {
        res.status(400).json({
            error: true,
            message: "Invalid page parameter. Must be an integer greater than or equal to 1."
        });
        return;
    }

    const perPage = 20;
    const currentPage = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const offset = (currentPage - 1) * perPage;

    req.db.from("ratings").where("userEmail", "=", userEmail).count("id as total")
        .then(([{ total }]) => {
            const totalInt = parseInt(total);
            const lastPage = Math.ceil(totalInt / perPage);

            return req.db.from("ratings")
                .where("userEmail", "=", userEmail)
                .select("rentalId", "rating", "comment", "dateTime")
                .limit(perPage)
                .offset(offset)
                .then(ratings => {
                    res.status(200).json({
                        data: ratings.map(r => {
                            const item = { rentalId: r.rentalId, rating: r.rating };
                            if (r.comment) item.comment = r.comment;
                            item.dateTime = r.dateTime;
                            return item;
                        }),
                        pagination: {
                            total: totalInt,
                            lastPage,
                            prevPage: currentPage > 1 ? currentPage - 1 : null,
                            nextPage: currentPage < lastPage ? currentPage + 1 : null,
                            perPage,
                            currentPage,
                            from: offset,
                            to: offset + ratings.length
                        }
                    });
                });
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});

// GET /ratings/rentals/:id - requires auth
router.get('/rentals/:id', authorisation, (req, res, next) => {
    const { id } = req.params;

    req.db.from("ratings").select("*").where("rentalId", "=", id)
        .then(ratings => {
            if (ratings.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rating exists with this rental ID."
                });
                return;
            }

            const result = ratings.map(r => {
                const response = { rating: r.rating };
                if (r.comment) response.comment = r.comment;
                response.dateTime = r.dateTime;
                return response;
            });

            res.status(200).json(result);
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

    if (comment !== undefined && (typeof comment !== "string" || comment.length < 1 || comment.length > 2000)) {
        res.status(400).json({
            error: true,
            message: "Invalid comment parameter. Comment must be a string 1-2000 characters long."
        });
        return;
    }

    req.db.from("data").select("*").where("id", "=", id)
        .then(rows => {
            if (rows.length === 0) {
                res.status(404).json({
                    error: true,
                    message: "No rental exists with this ID."
                });
                return;
            }

            const token = req.headers.authorization.replace(/^Bearer /, "");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.email;
            const dateTime = new Date();

            return req.db.from("ratings").select("*")
                .where("rentalId", "=", id)
                .where("userEmail", "=", userEmail)
                .then(existing => {
                    if (existing.length > 0) {
                        return req.db.from("ratings")
                            .where("rentalId", "=", id)
                            .where("userEmail", "=", userEmail)
                            .update({ rating, comment: comment || null, dateTime })
                            .then(() => {
                                const response = { rating };
                                if (comment) response.comment = comment;
                                response.dateTime = dateTime;
                                res.status(201).json(response);
                            });
                    } else {
                        return req.db.from("ratings")
                            .insert({ rentalId: id, userEmail, rating, comment: comment || null, dateTime })
                            .then(() => {
                                const response = { rating };
                                if (comment) response.comment = comment;
                                response.dateTime = dateTime;
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