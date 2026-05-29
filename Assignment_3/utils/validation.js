// Validates that all provided fields are present and not empty.
const hasRequiredFields = (...fields) =>
  fields.every((f) => f !== undefined && f !== null && f !== "");

// Validates that all provided fields are strings.
const isValidStrings = (...fields) =>
  fields.every((f) => typeof f === "string");

export { hasRequiredFields, isValidStrings };