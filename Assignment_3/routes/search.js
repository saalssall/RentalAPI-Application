import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
  // 1. Check for invalid query parameters
  const validParams = [
    "suburb",
    "state",
    "postcode",
    "minimumRent",
    "maximumRent",
    "minimumBathrooms",
    "maximumBathrooms",
    "minimumBedrooms",
    "maximumBedrooms",
    "minimumParking",
    "maximumParking",
    "propertyTypes",
    "minimumRating",
    "maximumRating",
    "sortBy",
    "sortOrder",
    "page",
  ];
  const invalidParams = Object.keys(req.query).filter(
    (key) => !validParams.includes(key),
  );

  if (invalidParams.length > 0) {
    res.status(400).json({
      error: true,
      message: `Invalid query parameters: ${invalidParams.join(", ")}`,
    });
    return;
  }

  // 2. Pagination setup
  const perPage = 10;
  const currentPage =
    parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const offset = (currentPage - 1) * perPage;

  // page - validate greater than or equal to 1
// 1. page validation
if (req.query.page !== undefined && (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 1)) {
    res.status(400).json({
        error: true,
        message: "Invalid page parameter. Must be an integer greater than or equal to 1."
    });
    return;
}

// 2. sortOrder value check FIRST
if (req.query.sortOrder && req.query.sortOrder !== 'asc' && req.query.sortOrder !== 'desc') {
    res.status(400).json({
        error: true,
        message: "Invalid sortOrder parameter. Must be 'asc' or 'desc'."
    });
    return;
}

// 3. sortOrder requires sortBy
if (req.query.sortOrder && !req.query.sortBy) {
    res.status(400).json({
        error: true,
        message: "Invalid sortOrder parameter. sortBy must be specified."
    });
    return;
}

// 4. sortBy validation LAST
const validSortFields = ['rent', 'bathrooms', 'bedrooms', 'parkingSpaces', 'suburb', 'latitude', 'longitude', 'postcode', 'averageRating', 'numRatings'];
if (req.query.sortBy && !validSortFields.includes(req.query.sortBy)) {
    res.status(400).json({
        error: true,
        message: "Invalid sortBy parameter. Must refer to a valid sortable property."
    });
    return;
}

const sortBy = req.query.sortBy || 'id';
const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  // 4. Build base query with filters
  let query = req.db.from("data");
// propertyTypes - supports single or multiple values
if (req.query.propertyTypes) {
    const propertyTypes = Array.isArray(req.query.propertyTypes) 
        ? req.query.propertyTypes 
        : [req.query.propertyTypes];
    query = query.whereIn("propertyType", propertyTypes);  
}
  if (req.query.suburb) query = query.where("suburb", "=", req.query.suburb);
  if (req.query.state) query = query.where("state", "=", req.query.state);
  // postcode - validate range 0000-9999
  if (req.query.postcode) {
    const postcode = parseInt(req.query.postcode);
    if (isNaN(postcode) || postcode < 0 || postcode > 9999) {
      res.status(400).json({
        error: true,
        message:
          "Invalid postcode parameter. Must be an integer in the range of 0000-9999.",
      });
      return;
    }
    query = query.where("postcode", "=", postcode);
  }
  // minimumRent - validate non-negative integer
  if (req.query.minimumRent) {
    const minimumRent = parseInt(req.query.minimumRent);
    if (isNaN(minimumRent) || minimumRent < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid minimumRent parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("rent", ">=", minimumRent);
  }

  // maximumRent - validate non-negative integer
  if (req.query.maximumRent) {
    const maximumRent = parseInt(req.query.maximumRent);
    if (isNaN(maximumRent) || maximumRent < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid maximumRent parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("rent", "<=", maximumRent);
  }

  // minimumBathroom - validate non-negative integer
  if (req.query.minimumBathrooms) {
    const minimumBathrooms = parseInt(req.query.minimumBathrooms);
    if (isNaN(minimumBathrooms) || minimumBathrooms < 0) {
        res.status(400).json({
            error: true,
            message: "Invalid minimumBathrooms parameter. Must be a non-negative integer."
        });
        return;
    }
    query = query.where("bathrooms", ">=", minimumBathrooms);
}

if (req.query.maximumBathrooms) {
    const maximumBathrooms = parseInt(req.query.maximumBathrooms);
    if (isNaN(maximumBathrooms) || maximumBathrooms < 0) {
        res.status(400).json({
            error: true,
            message: "Invalid maximumBathrooms parameter. Must be a non-negative integer."
        });
        return;
    }
    query = query.where("bathrooms", "<=", maximumBathrooms);
}

  // minimumBedrooms - validate non-negative integer
  if (req.query.minimumBedrooms) {
    const minimumBedrooms = parseInt(req.query.minimumBedrooms);
    if (isNaN(minimumBedrooms) || minimumBedrooms < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid minimumBedrooms parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("bedrooms", ">=", minimumBedrooms);
  }

  // maximumBedrooms - validate non-negative integer
  if (req.query.maximumBedrooms) {
    const maximumBedrooms = parseInt(req.query.maximumBedrooms);
    if (isNaN(maximumBedrooms) || maximumBedrooms < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid maximumBedrooms parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("bedrooms", "<=", maximumBedrooms);
  }

  // minimumParking - validate non-negative integer
  if (req.query.minimumParking) {
    const minimumParking = parseInt(req.query.minimumParking);
    if (isNaN(minimumParking) || minimumParking < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid minimumParking parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("parkingSpaces", ">=", minimumParking);
  }

  // maximumParking - validate non-negative integer
  if (req.query.maximumParking) {
    const maximumParking = parseInt(req.query.maximumParking);
    if (isNaN(maximumParking) || maximumParking < 0) {
      res.status(400).json({
        error: true,
        message:
          "Invalid maximumParking parameter. Must be a non-negative integer.",
      });
      return;
    }
    query = query.where("parkingSpaces", "<=", maximumParking);
  }


  // 5. Get total count first
  query
    .clone()
    .count("id as total")
    .then(([{ total }]) => {
      const totalInt = parseInt(total);
      const lastPage = Math.ceil(totalInt / perPage);

      // 6. Get paginated results
      return query
        .clone()
        .select("*")
        .orderBy(sortBy, sortOrder)
        .limit(perPage)
        .offset(offset)
        .then((rows) => {
          // 7. Get ratings for each rental
          return req.db
            .from("ratings")
            .select("*")
            .then((allRatings) => {
              // 8. Parse numbers and add ratings
              const rentals = rows.map((row) => {
                const rentalRatings = allRatings.filter(
                  (r) => r.rentalId === row.id,
                );
                const numRatings = rentalRatings.length;
                const averageRating =
                  numRatings === 0
                    ? null
                    : rentalRatings.reduce((sum, r) => sum + r.rating, 0) /
                      numRatings;

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
                  numRatings,
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
                  to: offset + rows.length,
                },
              });
            });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true, message: "Error in MySQL query" });
    });
});

export default router;
