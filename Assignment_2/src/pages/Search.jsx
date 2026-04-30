import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Typography, TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Chip, Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import RatingDialog from "../components/Rating";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";
import STATES from "../constants/states";
import PROPERTY_TYPES from "../constants/property_types";

const MIN_FIELDS = ["bedrooms", "bathrooms", "parking"];
const DEFAULT_MINS = { bedrooms: "", bathrooms: "", parking: "" };

// ── Search Page ──────────────────────────────────────────
export default function Search() {
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("Any");
  const [mins, setMins] = useState(DEFAULT_MINS);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Handler for minimum fields to ensure non-negative values
  const handleMin = (field) => (e) =>
    setMins((prev) => ({ ...prev, [field]: Math.max(0, Number(e.target.value)) }));
  // Fetch search results based on filters and pagination
  async function fetchResults(currentPage = 1) {
    setLoading(true);
    setError(null);

    const base = { page: null, ...(state && { state }), ...(postcode && { postcode }), ...(propertyType !== "Any" && { propertyType }) };
    const makeParams = (p) => new URLSearchParams({ ...base, page: p });

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/rentals/search?${makeParams(currentPage * 2 - 1)}`, { headers: { accept: "application/json" } }),
        fetch(`${API_URL}/rentals/search?${makeParams(currentPage * 2)}`, { headers: { accept: "application/json" } }),
      ]);
      const [json1, json2] = await Promise.all([res1.json(), res2.json()]);
      if (json1.error) throw new Error(json1.message);

      const combined = [...(json1.data ?? []), ...(json2.data ?? [])]
        .filter((p) =>
          p.bedrooms >= mins.bedrooms &&
          p.bathrooms >= mins.bathrooms &&
          p.parkingSpaces >= mins.parking
        )
        .slice(0, 12);

      setResults(combined);
      setPagination(json1.pagination ?? null);
    } catch (err) {
      setError(err.message || "Failed to fetch results.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }
  // Handlers for search, pagination, and reset
  function handleSearch() { setSearched(true); setPage(1); fetchResults(1); }
  function handlePageChange(_, newPage) { setPage(newPage); fetchResults(newPage); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleReset() {
    setState(""); setPostcode(""); setPropertyType("Any"); setMins(DEFAULT_MINS);
    setResults([]); setPagination(null); setError(null); setSearched(false); setPage(1);
  }

  return (
    <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} color={COLORS.darkgreen} sx={{ mb: 3 }}>
        Search Rentals
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color={COLORS.dark} sx={{ mb: 1 }}>State</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {STATES.map((s) => (
                  <Chip key={s} label={s} onClick={() => setState(state === s ? "" : s)}
                    sx={{
                      borderRadius: "50px", fontWeight: 600,
                      backgroundColor: state === s ? COLORS.darkgreen : COLORS.white,
                      color: state === s ? COLORS.white : COLORS.darkgreen,
                      border: `2px solid ${COLORS.darkgreen}`,
                      "&:hover": { backgroundColor: state === s ? COLORS.darkgreen : COLORS.muted },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)}
                inputProps={{ maxLength: 4 }} fullWidth />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select value={propertyType} label="Property Type" onChange={(e) => setPropertyType(e.target.value)}>
                  {PROPERTY_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {/* Minimum Fields */}
            {MIN_FIELDS.map((field) => (
              <Grid item xs={12} sm={4} key={field}>
                <TextField
                  label={`Min ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  type="number" value={mins[field]} onChange={handleMin(field)}
                  inputProps={{ min: 0 }} fullWidth
                />
              </Grid>
            ))}

            {/* Buttons */}
            <Grid item xs={12} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                onClick={handleSearch} disabled={loading}
                sx={{ backgroundColor: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.yellow } }}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outlined" onClick={handleReset}
                sx={{ borderColor: COLORS.darkgreen, color: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.yellow } }}>
                Reset
              </Button>
              <Button variant="outlined" component={Link} to="/advanced-search"
                startIcon={<TuneIcon />}
                sx={{ borderColor: COLORS.darkgreen, color: COLORS.darkgreen, ml: "auto", "&:hover": { backgroundColor: COLORS.yellow } }}>
                Advanced Search
              </Button>
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {results.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} color={COLORS.dark} sx={{ mb: 2 }}>
            {pagination?.total ?? results.length} Properties Found
          </Typography>
          <Grid container spacing={2}>
            {results.map((p) => (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <Card onClick={() => setSelectedProperty(p)}
                  sx={{
                    borderRadius: 3, boxShadow: 2, height: "100%", cursor: "pointer",
                    transition: "0.3s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                  }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color={COLORS.dark}>{p.title}</Typography>
                    <Typography variant="body2" fontWeight={600} color={COLORS.dark}>${p.rent}/week</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">🏠 {p.propertyType}</Typography>
                    <Typography variant="body2">📍 {p.suburb}, {p.state} {p.postcode}</Typography>
                    <Typography variant="body2">🛏 {p.bedrooms} · 🚿 {p.bathrooms} · 🚗 {p.parkingSpaces}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1, color: COLORS.dark }}>
                      ⭐ {p.averageRating ?? "No rating"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* Pagination */}
          {pagination && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={pagination.lastPage} page={page} onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root": { color: COLORS.dark },
                  "& .Mui-selected": { backgroundColor: `${COLORS.dark} !important`, color: COLORS.darkgreen },
                }}
              />
            </Box>
          )}
        </>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <Alert severity="info">No properties found. Try adjusting your filters.</Alert>
      )}

      {!searched && (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Use the filters above to search for properties.
        </Typography>
      )}

      {selectedProperty && (
        <RatingDialog property={selectedProperty} open={Boolean(selectedProperty)} onClose={() => setSelectedProperty(null)} />
      )}
    </Box>
  );
}