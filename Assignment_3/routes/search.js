import express from 'express';
const router = express.Router();

router.get('/', (req, res, next) => {
    // 1. Check for invalid query parameters
    const validParams = [
        'suburb', 'state', 'postcode', 'minimumRent', 'maximumRent',
        'minimumBathroom', 'maximumBathroom', 'minimumBedrooms', 'maximumBedrooms',
        'minimumParking', 'maximumParking', 'propertyTypes', 'minimumRating',
        'maximumRating', 'sortBy', 'sortOrder', 'page'
    ];
    const invalidParams = Object.keys(req.query).filter(key => !validParams.includes(key));

    if (invalidParams.length > 0) {
        res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${invalidParams.join(', ')}`
        });
        return;
    }

    // 2. Pagination setup
    const perPage = 10;
    const currentPage = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const offset = (currentPage - 1) * perPage;

    // 3. Build base query with filters
    let query = req.db.from("data");

    if (req.query.suburb) query = query.where("suburb", "=", req.query.suburb);
    if (req.query.state) query = query.where("state", "=", req.query.state);
    if (req.query.postcode && !isNaN(parseInt(req.query.postcode)))
        query = query.where("postcode", "=", parseInt(req.query.postcode));
    if (req.query.minimumRent && !isNaN(parseInt(req.query.minimumRent)))
        query = query.where("rent", ">=", parseInt(req.query.minimumRent));
    if (req.query.maximumRent && !isNaN(parseInt(req.query.maximumRent)))
        query = query.where("rent", "<=", parseInt(req.query.maximumRent));
    if (req.query.minimumBathroom && parseInt(req.query.minimumBathroom) > 0)
        query = query.where("bathrooms", ">=", parseInt(req.query.minimumBathroom));
    if (req.query.maximumBathroom && parseInt(req.query.maximumBathroom) > 0)
        query = query.where("bathrooms", "<=", parseInt(req.query.maximumBathroom));
    if (req.query.minimumBedrooms && parseInt(req.query.minimumBedrooms) > 0)
        query = query.where("bedrooms", ">=", parseInt(req.query.minimumBedrooms));
    if (req.query.maximumBedrooms && parseInt(req.query.maximumBedrooms) > 0)
        query = query.where("bedrooms", "<=", parseInt(req.query.maximumBedrooms));
    if (req.query.minimumParking && parseInt(req.query.minimumParking) > 0)
        query = query.where("parkingSpaces", ">=", parseInt(req.query.minimumParking));
    if (req.query.maximumParking && parseInt(req.query.maximumParking) > 0)
        query = query.where("parkingSpaces", "<=", parseInt(req.query.maximumParking));

    // 4. Sorting
    const validSortFields = ['rent', 'bathrooms', 'bedrooms', 'parkingSpaces', 'suburb'];
    const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    // 5. Get total count first
    query.clone().count('id as total')
        .then(([{ total }]) => {
            const totalInt = parseInt(total);
            const lastPage = Math.ceil(totalInt / perPage);

            // 6. Get paginated results
            return query.clone()
                .select("*")
                .orderBy(sortBy, sortOrder)
                .limit(perPage)
                .offset(offset)
                .then(rows => {
                    // 7. Get ratings for each rental
                    return req.db.from("ratings").select("*")
                        .then(allRatings => {
                            // 8. Parse numbers and add ratings
                            const rentals = rows.map(row => {
                                const rentalRatings = allRatings.filter(r => r.rentalId === row.id);
                                const numRatings = rentalRatings.length;
                                const averageRating = numRatings === 0 ? null :
                                    rentalRatings.reduce((sum, r) => sum + r.rating, 0) / numRatings;

                                return {
                                    ...row,
                                    id: parseInt(row.id),
                                    rent: parseInt(row.rent),
                                    latitude: parseFloat(row.latitude),
                                    longitude: parseFloat(row.longitude),
                                    postcode: parseInt(row.postcode),
                                    bathrooms: parseInt(row.bathrooms),
                                    bedrooms: parseInt(row.bedrooms),
                                    parkingSpaces: parseInt(row.parkingSpaces),
                                    averageRating,
                                    numRatings
                                };
                            });

                            // 9. Return paginated results
                            res.status(200).json({
                                data: rentals,
                                pagination: {
                                    total: totalInt,
                                    lastPage,
                                    prevPage: currentPage > 1 ? currentPage - 1 : null,
                                    nextPage: currentPage < lastPage ? currentPage + 1 : null,
                                    perPage,
                                    currentPage,
                                    from: offset,
                                    to: offset + rows.length
                                }
                            });
                        });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});

export default router;