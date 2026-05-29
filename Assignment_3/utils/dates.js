
// Formats a date to YYYY-MM-DD, or returns null if the input is falsy. If the input is already a string, it assumes it's in the correct format and just splits off any time component.
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date.split("T")[0];
  const d = new Date(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};// Validates that dob is in the format YYYY-MM-DD and is a real date.
const isValidDobFormat = (dob) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const [year, month, day] = dob.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};

// Validates that dob is a date in the past.
const isPastDate = (dob) => {
  const [year, month, day] = dob.split("-").map(Number);
  return new Date(year, month - 1, day) < new Date();
};


export { formatDate, isValidDobFormat, isPastDate };