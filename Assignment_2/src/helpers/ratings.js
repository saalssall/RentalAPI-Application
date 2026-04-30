export function saveRating(property, rating) {
  const saved = JSON.parse(localStorage.getItem("myRatings") || "{}");
  saved[property.id] = {
    id: property.id, rating,
    title: property.title, rent: property.rent,
    propertyType: property.propertyType,
    suburb: property.suburb, state: property.state, postcode: property.postcode,
    bedrooms: property.bedrooms, bathrooms: property.bathrooms, parkingSpaces: property.parkingSpaces,
    averageRating: property.averageRating,
    dateTime: new Date(),
  };
  localStorage.setItem("myRatings", JSON.stringify(saved));
}
export function getSavedRatings() {
  const saved = JSON.parse(localStorage.getItem("myRatings") || "{}");
  return Object.values(saved);
}