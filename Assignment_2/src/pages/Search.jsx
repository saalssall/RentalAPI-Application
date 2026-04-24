import { useState } from "react";
import {
  Box, Typography, TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Chip, Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RatingDialog from "../components/Rating";

const API_URL = "http://4.237.58.241:3000";
const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const PROPERTY_TYPES = ["Any", "Apartment", "House", "Townhouse", "Unit", "Studio", "Villa"];
const COLORS = { dark: "#1B4332", light: "#D4EDBA", muted: "#A8D5A2" };

export default function Search() {
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("Any");
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);  

  async function fetchResults(currentPage = 1) {
    setLoading(true);
    setError(null);

    const params1 = new URLSearchParams({ page: currentPage * 2 - 1 });
    const params2 = new URLSearchParams({ page: currentPage * 2 });

    if (state) { params1.append("state", state); params2.append("state", state); }
    if (postcode) { params1.append("postcode", postcode); params2.append("postcode", postcode); }
    if (propertyType !== "Any") { params1.append("propertyType", propertyType); params2.append("propertyType", propertyType); }

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/rentals/search?${params1}`, { headers: { accept: "application/json" } }),
        fetch(`${API_URL}/rentals/search?${params2}`, { headers: { accept: "application/json" } }),
      ]);
      const [json1, json2] = await Promise.all([res1.json(), res2.json()]);
      if (json1.error) throw new Error(json1.message);
      const combined = [...(json1.data ?? []), ...(json2.data ?? [])].slice(0, 12);
      setResults(combined);
      setPagination(json1.pagination ?? null);
    } catch (err) {
      setError(err.message || "Failed to fetch results.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() { setSearched(true); setPage(1); fetchResults(1); }
  function handlePageChange(_, newPage) { setPage(newPage); fetchResults(newPage); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleReset() {
    setState(""); setPostcode(""); setPropertyType("Any");
    setResults([]); setPagination(null); setError(null);
    setSearched(false); setPage(1);
  }

  return (
    <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} color={COLORS.dark} sx={{ mb: 3 }}>
        Search Rentals
      </Typography>

      {/* Filters */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color={COLORS.dark} sx={{ mb: 1 }}>State</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {STATES.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => setState(state === s ? "" : s)}
                    sx={{
                      borderRadius: "50px", fontWeight: 600,
                      backgroundColor: state === s ? COLORS.dark : "#fff",
                      color: state === s ? "#fff" : COLORS.dark,
                      border: `2px solid ${COLORS.dark}`,
                      "&:hover": { backgroundColor: state === s ? "#2D6A4F" : COLORS.muted },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Postcode" value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                inputProps={{ maxLength: 4 }} fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select value={propertyType} label="Property Type" onChange={(e) => setPropertyType(e.target.value)}>
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                onClick={handleSearch} disabled={loading}
                sx={{ backgroundColor: COLORS.dark, "&:hover": { backgroundColor: "#2D6A4F" } }}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outlined" onClick={handleReset} sx={{ borderColor: COLORS.dark, color: COLORS.dark }}>
                Reset
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
                <Card
                  onClick={() => setSelectedProperty(p)}  // ✅ opens dialog on click
                  sx={{
                    borderRadius: 3, boxShadow: 2, height: "100%", cursor: "pointer",
                    transition: "0.3s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                  }}
                >
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

          {pagination && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.lastPage} page={page} onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root": { color: COLORS.dark },
                  "& .Mui-selected": { backgroundColor: `${COLORS.dark} !important`, color: "#fff" },
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

      {/* Rating Dialog */}
      {selectedProperty && (
        <RatingDialog
          property={selectedProperty}
          open={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
        />
      )}

    </Box>
  );
}