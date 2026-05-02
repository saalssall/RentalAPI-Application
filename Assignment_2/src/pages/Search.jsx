import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Chip, Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";

const MIN_FIELDS = ["bedrooms", "bathrooms", "parking"];
const DEFAULT_MINS = { bedrooms: "", bathrooms: "", parking: "" };

export default function Search() {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const [rentalId, setRentalId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [states, setStates] = useState([]);
  const [mins, setMins] = useState(DEFAULT_MINS);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/rentals/states`, { headers: { accept: "application/json" } })
      .then(res => res.json())
      .then(json => setStates(Array.isArray(json) ? json : []))
      .catch(() => setStates([]));
  }, []);

  const handleMin = (field) => (e) =>
    setMins((prev) => ({ ...prev, [field]: Math.max(0, Number(e.target.value)) }));

  async function fetchResults(currentPage = 1) {
    setLoading(true);
    setError(null);

    // If rental ID is entered, fetch directly by ID
    if (rentalId.trim()) {
      try {
        const res = await fetch(`${API_URL}/rentals/${rentalId.trim()}`, {
          headers: { accept: "application/json" }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Property not found.");
        setResults([json]);
        setPagination(null);
      } catch (err) {
        setError(err.message || "Failed to fetch property.");
        setResults([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise proceed with normal search
    const base = { page: null, ...(state && { state }), ...(postcode && { postcode }) };
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

  function handleSearch() { setSearched(true); setPage(1); fetchResults(1); }
  function handlePageChange(_, newPage) { setPage(newPage); fetchResults(newPage); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleReset() {
    setState(""); setPostcode(""); setRentalId(""); setMins(DEFAULT_MINS);
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

            {/* State chips — from API */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color={COLORS.dark} sx={{ mb: 1 }}>State</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(states ?? []).map((s) => (
                  <Chip key={s} label={s} onClick={() => setState(state === s ? "" : s)}
                    aria-pressed={state === s}
                    role="button"
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
              <TextField
                label="Rental ID"
                value={rentalId}
                onChange={(e) => setRentalId(e.target.value)}
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)}
                inputProps={{ maxLength: 4 }} fullWidth />
            </Grid>

            {MIN_FIELDS.map((field) => (
              <Grid item xs={12} sm={4} key={field}>
                <TextField
                  label={`Min ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  type="number" value={mins[field]} onChange={handleMin(field)}
                  inputProps={{ min: 0 }} fullWidth
                />
              </Grid>
            ))}

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

      {error && <Alert severity="error" role="alert" sx={{ mb: 3 }}>{error}</Alert>}

      {results.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} color={COLORS.dark} sx={{ mb: 2 }}>
            {pagination?.total ?? results.length} Properties Found
          </Typography>
          <Grid container spacing={2}>
            {results.map((p) => (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <Card
                  onClick={() => navigate(`/rentals/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/rentals/${p.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${p.title}`}
                  sx={{
                    borderRadius: 3, boxShadow: 2, height: "100%", cursor: "pointer",
                    transition: "0.3s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                    "&:focus": { outline: `2px solid ${COLORS.darkgreen}`, outlineOffset: "2px" },
                    "@media (prefers-reduced-motion: reduce)": { transition: "none", transform: "none" },
                  }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color={COLORS.dark}>{p.title}</Typography>
                    <Typography variant="body2" fontWeight={600} color={COLORS.dark}>${p.rent}/week</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <span aria-hidden="true">🏠</span> {p.propertyType}
                    </Typography>
                    <Typography variant="body2">
                      <span aria-hidden="true">📍</span> {p.suburb}, {p.state} {p.postcode}
                    </Typography>
                    <Typography variant="body2">
                      Bedrooms: {p.bedrooms} <span aria-hidden="true">🛏</span> ·{" "}
                      Bathrooms: {p.bathrooms} <span aria-hidden="true">🚿</span> ·{" "}
                      Parking: {p.parkingSpaces} <span aria-hidden="true">🚗</span>
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1, color: COLORS.dark }}>
                      Average rating: {p.averageRating ?? "No rating"} <span aria-hidden="true">⭐</span>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {pagination && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={pagination.lastPage} page={page} onChange={handlePageChange}
                aria-label="Search results pages"
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
        <Alert severity="info" role="status">No properties found. Try adjusting your filters.</Alert>
      )}

      {!searched && (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Use the filters above to search for properties.
        </Typography>
      )}
    </Box>
  );
}