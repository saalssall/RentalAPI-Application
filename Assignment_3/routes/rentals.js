import express from 'express';
const router = express.Router();

router.get('/:id', (req, res, next) => {
    // 1. Check for invalid query parameters
    const validParams = []; // no valid query params for this route
    const invalidParams = Object.keys(req.query).filter(key => !validParams.includes(key));

    if (invalidParams.length > 0) {
        // 1.1 If invalid query params, return error response
        res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${invalidParams.join(', ')}`
        });
        return;
    }

    // 2. Retrieve rental data for the specific id
    const { id } = req.params;
    req.db.from("data").select("*").where("id", "=", id)
        .then(rows => {
            if (rows.length === 0) {
                // 2.1 If no data found, return error response
                res.status(404).json({
                    error: true,
                    message: `No rental found with id ${id}`
                });
                return;
            }
            // 2.2 Return the rental data as an object
            const rental = rows[0];
            res.status(200).json({
                ...rental,
                latitude: parseFloat(rental.latitude),
                longitude: parseFloat(rental.longitude)
            });
        })
        .catch(err => {
            // 3. If error, return error response
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});

export default router;