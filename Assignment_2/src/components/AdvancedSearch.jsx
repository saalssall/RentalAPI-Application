import { useState } from "react";
import {
  Box, Typography, TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Chip, Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RatingDialog from "../components/Rating";
import API_URL from "../constants/api";

const COLORS = { dark: "#1B4332", light: "#D4EDBA", muted: "#A8D5A2" };

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const PROPERTY_TYPES = [
  "acreage/semi-rural", "apartment", "duplex/semi-detached", "flat",
  "house", "other", "studio", "terrace", "townhouse", "unit", "villa",
];
const SORT_FIELDS = [
  "id", "title", "rent", "propertyType", "postcode", "state", "suburb",
  "bathrooms", "bedrooms", "parkingSpaces", "averageRating", "numRatings",
];

const DEFAULT_FILTERS = {
  state: "", suburb: "", postcode: "",
  minimumRent: "", maximumRent: "",
  minimumBedrooms: "", maximumBedrooms: "",
  minimumBathrooms: "", maximumBathrooms: "",
  minimumParking: "", maximumParking: "",
  minimumRating: "", maximumRating: "",
  propertyTypes: [],
  sortBy: "", sortOrder: "asc",
};

export default function AdvancedSearch() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const set = (field) => (e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const togglePropertyType = (type) =>
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));

  async function fetchResults(currentPage = 1) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: currentPage });
    const add = (key, val) => { if (val !== "" && val !== null) params.append(key, val); };

    add("state",          filters.state);
    add("suburb",         filters.suburb);
    add("postcode",       filters.postcode);
    add("minimumRent",    filters.minimumRent);
    add("maximumRent",    filters.maximumRent);
    add("minimumBedrooms",  filters.minimumBedrooms);
    add("maximumBedrooms",  filters.maximumBedrooms);
    add("minimumBathrooms", filters.minimumBathrooms);
    add("maximumBathrooms", filters.maximumBathrooms);
    add("minimumParking",   filters.minimumParking);
    add("maximumParking",   filters.maximumParking);
    add("minimumRating",    filters.minimumRating);
    add("maximumRating",    filters.maximumRating);
    add("sortBy",           filters.sortBy);
    if (filters.sortBy) add("sortOrder", filters.sortOrder);
    filters.propertyTypes.forEach((t) => params.append("propertyTypes", t));

    try {
      const res = await fetch(`${API_URL}/rentals/search?${params}`, {
        headers: { accept: "application/json" },
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      setResults(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch (err) {
      setError(err.message || "Failed to fetch results.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() { setSearched(true); setPage(1); fetchResults(1); }
  function handlePageChange(_, newPage) { setPage(newPage); fetchResults(newPage); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleReset() { setFilters(DEFAULT_FILTERS); setResults([]); setPagination(null); setError(null); setSearched(false); setPage(1); }

  return (
    <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} color={COLORS.dark} sx={{ mb: 3 }}>
        Advanced Search
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color={COLORS.dark} sx={{ mb: 1 }}>State</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {STATES.map((s) => (
                  <Chip key={s} label={s}
                    onClick={() => setFilters((prev) => ({ ...prev, state: prev.state === s ? "" : s }))}
                    sx={{
                      borderRadius: "50px", fontWeight: 600,
                      backgroundColor: filters.state === s ? COLORS.dark : "#fff",
                      color: filters.state === s ? "#fff" : COLORS.dark,
                      border: `2px solid ${COLORS.dark}`,
                      "&:hover": { backgroundColor: filters.state === s ? "#2D6A4F" : COLORS.muted },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField label="Suburb" value={filters.suburb} onChange={set("suburb")} fullWidth />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField label="Postcode" value={filters.postcode} onChange={set("postcode")} inputProps={{ maxLength: 4 }} fullWidth />
            </Grid>

            {/* Rent range */}
            <Grid item xs={12} sm={3}>
              <TextField label="Min Rent ($/week)" type="number" value={filters.minimumRent} onChange={set("minimumRent")} inputProps={{ min: 0 }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Max Rent ($/week)" type="number" value={filters.maximumRent} onChange={set("maximumRent")} inputProps={{ min: 0 }} fullWidth />
            </Grid>

            {/* Bedrooms range */}
            <Grid item xs={12} sm={3}>
              <TextField label="Min Bedrooms" type="number" value={filters.minimumBedrooms} onChange={set("minimumBedrooms")} inputProps={{ min: 0 }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Max Bedrooms" type="number" value={filters.maximumBedrooms} onChange={set("maximumBedrooms")} inputProps={{ min: 0 }} fullWidth />
            </Grid>

            {/* Bathrooms range */}
            <Grid item xs={12} sm={3}>
              <TextField label="Min Bathrooms" type="number" value={filters.minimumBathrooms} onChange={set("minimumBathrooms")} inputProps={{ min: 0 }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Max Bathrooms" type="number" value={filters.maximumBathrooms} onChange={set("maximumBathrooms")} inputProps={{ min: 0 }} fullWidth />
            </Grid>

            {/* Parking range */}
            <Grid item xs={12} sm={3}>
              <TextField label="Min Parking" type="number" value={filters.minimumParking} onChange={set("minimumParking")} inputProps={{ min: 0 }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Max Parking" type="number" value={filters.maximumParking} onChange={set("maximumParking")} inputProps={{ min: 0 }} fullWidth />
            </Grid>

            {/* Rating range */}
            <Grid item xs={12} sm={3}>
              <TextField label="Min Rating" type="number" value={filters.minimumRating} onChange={set("minimumRating")} inputProps={{ min: 0, max: 5, step: 0.5 }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Max Rating" type="number" value={filters.maximumRating} onChange={set("maximumRating")} inputProps={{ min: 0, max: 5, step: 0.5 }} fullWidth />
            </Grid>

            {/* Sort */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={filters.sortBy} label="Sort By" onChange={set("sortBy")}>
                  <MenuItem value="">None</MenuItem>
                  {SORT_FIELDS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!filters.sortBy}>
                <InputLabel>Sort Order</InputLabel>
                <Select value={filters.sortOrder} label="Sort Order" onChange={set("sortOrder")}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Property Types */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color={COLORS.dark} sx={{ mb: 1 }}>Property Types</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {PROPERTY_TYPES.map((type) => (
                  <Chip key={type} label={type} onClick={() => togglePropertyType(type)}
                    sx={{
                      borderRadius: "50px", fontWeight: 600, textTransform: "capitalize",
                      backgroundColor: filters.propertyTypes.includes(type) ? COLORS.dark : "#fff",
                      color: filters.propertyTypes.includes(type) ? "#fff" : COLORS.dark,
                      border: `2px solid ${COLORS.dark}`,
                      "&:hover": { backgroundColor: filters.propertyTypes.includes(type) ? "#2D6A4F" : COLORS.muted },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                onClick={handleSearch} disabled={loading}
                sx={{ backgroundColor: COLORS.dark, "&:hover": { backgroundColor: "#2D6A4F" } }}>
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

          {pagination && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={pagination.lastPage} page={page} onChange={handlePageChange}
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

      {selectedProperty && (
        <RatingDialog property={selectedProperty} open={Boolean(selectedProperty)} onClose={() => setSelectedProperty(null)} />
      )}
    </Box>
  );
}
