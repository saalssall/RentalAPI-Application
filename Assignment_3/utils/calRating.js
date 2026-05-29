// Returns the average of an array of rating objects, or null if empty.
const calcAverageRating = (ratings) => {
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
};

export default calcAverageRating;