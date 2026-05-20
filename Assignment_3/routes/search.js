import express from 'express';
import authorisation from '../middleware/authorisation.js';
const router = express.Router();

router.get('/', authorisation, (req, res, next) => {
    // 1. Check for invalid query parameters
    const validParams = [
    'suburb', 'state', 'postcode', 'minimumRent', 'maximumRent', 
    'minimumBathroom', 'maximumBathroom', 'minimumBedrooms', 'maximumBedrooms', 
    'minimumParking', 'maximumParking', 'propertyTypes', 'minimumRating',  'maximumRating', 'sortBy', 
    'sortOrder',  'page'
];
    const invalidParams = Object.keys(req.query).filter(key => !validParams.includes(key));

    if (invalidParams.length > 0) {
        res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${invalidParams.join(', ')}`
        });
        return;
    }

    // 2. Retrieve rental data from the database
    req.db.from("data").select("*").limit(10)
        .then(rows => {
            // 3. Parse numbers and return as array of objects
            const rentals = rows.map(row => ({
                ...row,
                id: parseInt(row.id),
                rent: parseInt(row.rent),
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude),
                postcode: parseInt(row.postcode),
                bathrooms: parseInt(row.bathrooms),
                bedrooms: parseInt(row.bedrooms),
                parkingSpaces: parseInt(row.parkingSpaces)
            }));
            res.status(200).json({ data: rentals });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});

export default router;