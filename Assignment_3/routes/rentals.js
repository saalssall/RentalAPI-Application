import express from 'express';
import calcAverageRating from '../utils/calRating.js';
const router = express.Router();


// Helpers
const buildReview = ({ userEmail, rating, dateTime, comment }) => {
    const review = { user: userEmail, rating, dateTime };
    if (comment != null) review.comment = comment;
    return review;
};

// Routes 
// GET /rentals/:id
router.get('/:id', async (req, res) => {
    // 1. Reject any unexpected query parameters
    const validParams = [];
    const invalidParams = Object.keys(req.query).filter(key => !validParams.includes(key));
    if (invalidParams.length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${invalidParams.join(', ')}`
        });
    }

    const { id } = req.params;

    try {
        // 2. Fetch rental
        const rental = await req.db.from("data").where("id", id).first();
        if (!rental) {
            return res.status(404).json({
                error: true,
                message: `No rental found with id ${id}`
            });
        }

        // 3. Fetch ratings and build response
        const ratings = await req.db.from("ratings").where("rentalId", id).select("*");

        res.status(200).json({
            ...rental,
            latitude: parseFloat(rental.latitude),
            longitude: parseFloat(rental.longitude),
            averageRating: calcAverageRating(ratings),
            numRatings: ratings.length,
            reviews: ratings.map(buildReview)
        });

    } catch (err) {
        console.error(`GET /:id error for id=${id}:`, err);
        res.status(500).json({ error: true, message: "Error in MySQL query" });
    }
});

export default router;