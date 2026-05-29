import express from "express";
import calcAverageRating from "../utils/calRating.js";
const router = express.Router();

// Constants and valid parameter lists
const PER_PAGE = 10;

const VALID_PARAMS = [
    "suburb", "state", "postcode",
    "minimumRent", "maximumRent",
    "minimumBathrooms", "maximumBathrooms",
    "minimumBedrooms", "maximumBedrooms",
    "minimumParking", "maximumParking",
    "propertyTypes", "minimumRating", "maximumRating",
    "sortBy", "sortOrder", "page",
];

const VALID_SORT_FIELDS = [
    "rent", "bathrooms", "bedrooms", "parkingSpaces",
    "suburb", "latitude", "longitude", "postcode",
    "averageRating", "numRatings",
];

// Helpers 
// Parses a string as a non-negative integer. Returns the integer value, 
// or null if the input is not a valid non-negative integer.
const parseNonNegativeInt = (value) => {
    const n = parseInt(value);
    return !isNaN(n) && n >= 0 ? n : null;
};

// Builds a rental object for the API response by combining a rental row from the database 
// with its associated ratings.
const buildRental = (row, allRatings) => {
    const rentalRatings = allRatings.filter(r => r.rentalId === row.id);
    return {
        ...row,
        id:           parseInt(row.id),
        rent:         parseInt(row.rent),
        latitude:     parseFloat(row.latitude),
        longitude:    parseFloat(row.longitude),
        postcode:     parseInt(row.postcode),
        bathrooms:    parseInt(row.bathrooms),
        bedrooms:     parseInt(row.bedrooms),
        parkingSpaces: parseInt(row.parkingSpaces),
        averageRating: calcAverageRating(rentalRatings),
        numRatings:    rentalRatings.length,
    };
};

// Builds a pagination object for the API response based on the total number of items,
// current page, and items per page.
const buildPagination = (total, currentPage, offset, rowCount) => {
    const lastPage = Math.ceil(total / PER_PAGE);
    return {
        total,
        lastPage,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < lastPage ? currentPage + 1 : null,
        perPage: PER_PAGE,
        currentPage,
        from: offset,
        to: offset + rowCount,
    };
};

// Validates and applies a min/max numeric filter to a knex query.
// Returns the updated query, or sends a 400 and returns null on invalid input.
const applyRangeFilter = (res, query, paramValue, paramName, column, operator) => {
    const value = parseNonNegativeInt(paramValue);
    if (value === null) {
        res.status(400).json({
            error: true,
            message: `Invalid ${paramName} parameter. Must be a non-negative integer.`
        });
        return null;
    }
    return query.where(column, operator, value);
};

// Route Handlers 

// GET /rentals
router.get("/", async (req, res) => {
    const q = req.query;

    // 1. Reject unknown query parameters
    const invalidParams = Object.keys(q).filter(key => !VALID_PARAMS.includes(key));
    if (invalidParams.length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${invalidParams.join(", ")}`
        });
    }

    // 2. Validate page
    if (q.page !== undefined && (isNaN(parseInt(q.page)) || parseInt(q.page) < 1)) {
        return res.status(400).json({
            error: true,
            message: "Invalid page parameter. Must be an integer greater than or equal to 1."
        });
    }

    // 3. Validate sortOrder value, then sortOrder/sortBy dependency
    if (q.sortOrder && q.sortOrder !== "asc" && q.sortOrder !== "desc") {
        return res.status(400).json({
            error: true,
            message: "Invalid sortOrder parameter. Must be 'asc' or 'desc'."
        });
    }
    if (q.sortOrder && !q.sortBy) {
        return res.status(400).json({
            error: true,
            message: "Invalid sortOrder parameter. sortBy must be specified."
        });
    }
    if (q.sortBy && !VALID_SORT_FIELDS.includes(q.sortBy)) {
        return res.status(400).json({
            error: true,
            message: "Invalid sortBy parameter. Must refer to a valid sortable property."
        });
    }

    // 4. Pagination
    const currentPage = parseInt(q.page) > 0 ? parseInt(q.page) : 1;
    const offset = (currentPage - 1) * PER_PAGE;
    const sortBy = q.sortBy || "id";
    const sortOrder = q.sortOrder || "asc";

    // 5. Build filtered query
    // Each range filter returns null and sends a 400 if invalid, so we return early.
    let query = req.db.from("data");

    if (q.propertyTypes) {
        const types = Array.isArray(q.propertyTypes) ? q.propertyTypes : [q.propertyTypes];
        query = query.whereIn("propertyType", types);
    }
    if (q.suburb)   query = query.where("suburb", q.suburb);
    if (q.state)    query = query.where("state",  q.state);

    if (q.postcode) {
        const postcode = parseNonNegativeInt(q.postcode);
        if (postcode === null || postcode > 9999) {
            return res.status(400).json({
                error: true,
                message: "Invalid postcode parameter. Must be an integer in the range of 0000-9999."
            });
        }
        query = query.where("postcode", postcode);
    }

    const rangeFilters = [
        { param: "minimumRent",      column: "rent",          op: ">=" },
        { param: "maximumRent",      column: "rent",          op: "<=" },
        { param: "minimumBathrooms", column: "bathrooms",     op: ">=" },
        { param: "maximumBathrooms", column: "bathrooms",     op: "<=" },
        { param: "minimumBedrooms",  column: "bedrooms",      op: ">=" },
        { param: "maximumBedrooms",  column: "bedrooms",      op: "<=" },
        { param: "minimumParking",   column: "parkingSpaces", op: ">=" },
        { param: "maximumParking",   column: "parkingSpaces", op: "<=" },
    ];

    for (const { param, column, op } of rangeFilters) {
        if (q[param] !== undefined) {
            query = applyRangeFilter(res, query, q[param], param, column, op);
            if (!query) return; // 400 already sent
        }
    }

    try {
        // 6. Count total matching rows
        const [{ total }] = await query.clone().count("id as total");
        const totalInt = parseInt(total);

        // 7. Fetch paginated rows
        const rows = await query.clone()
            .select("*")
            .orderBy(sortBy, sortOrder)
            .limit(PER_PAGE)
            .offset(offset);

        // 8. Fetch all ratings and join in memory
        const allRatings = await req.db.from("ratings").select("rentalId", "rating");

        // 9. Build and return response
        res.status(200).json({
            data: rows.map(row => buildRental(row, allRatings)),
            pagination: buildPagination(totalInt, currentPage, offset, rows.length),
        });

    } catch (err) {
        console.error("GET /rentals error:", err);
        res.status(500).json({ error: true, message: "Error in MySQL query" });
    }
});

export default router;