import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Pagination
} from "@mui/material";
import { useLocation } from "react-router-dom";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";
import RatingDialog from "../components/Rating";

export default function MyRatings() {
  const [ratings, setRatings] = useState([]);
  const [rentals, setRentals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const location = useLocation();

  const fetchRatings = useCallback(async (pageNum) => {
    const token = localStorage.getItem("token");
    if (!token) { setError("You must be logged in to view your ratings."); setLoading(false); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ratings?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch ratings.");
      const json = await res.json();

      const list = Array.isArray(json) ? json : (json.ratings ?? json.data ?? []);
      setRatings(list);

      const rentalDetails = {};
      await Promise.all(
        list.map(async (r) => {
          try {
            const rentalRes = await fetch(`${API_URL}/rentals/${r.rentalId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (rentalRes.ok) {
              rentalDetails[r.rentalId] = await rentalRes.json();
            }
          } catch { }
        })
      );
      setRentals(rentalDetails);

      if (list.length < 20) setTotalPages(pageNum);
      else setTotalPages(pageNum + 1);

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatings(page);
  }, [page, fetchRatings, location.key]);

  return (
    <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} color={COLORS.darkgreen} sx={{ mb: 3 }}>
        My Ratings
      </Typography>

      {loading && (
        <Box role="status" aria-live="polite" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress aria-label="Loading ratings" sx={{ color: COLORS.darkgreen }} />
        </Box>
      )}

      {error && <Alert severity="error" role="alert">{error}</Alert>}

      {!loading && !error && ratings.length === 0 && (
        <Alert severity="info" role="status">You haven't rated any properties yet.</Alert>
      )}

      {!loading && ratings.length > 0 && (
        <>
          <Grid container spacing={2}>
            {ratings.map((r) => {
              const rental = rentals[r.rentalId];
              return (
                <Grid item xs={12} sm={6} md={3} key={r.rentalId}>
                  <Card
                    onClick={() => {
                      if (rental) setSelectedProperty({ ...rental, id: rental.id ?? r.rentalId });
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && rental) {
                        e.preventDefault();
                        setSelectedProperty(rental);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Update rating for ${rental?.title ?? `Rental #${r.rentalId}`}`}
                    sx={{
                      borderRadius: 3, boxShadow: 2, height: "100%", cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                      "&:focus": { outline: `2px solid ${COLORS.darkgreen}`, outlineOffset: "2px" },
                      "@media (prefers-reduced-motion: reduce)": { transition: "none", transform: "none" },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700} color={COLORS.darkgreen}>
                        {rental?.title ?? `Rental #${r.rentalId}`}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={COLORS.darkgreen}>
                        {rental ? `$${rental.rent}/week` : ""}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <span aria-hidden="true">🏠</span> {rental?.propertyType ?? "—"}
                      </Typography>
                      <Typography variant="body2">
                        <span aria-hidden="true">📍</span> {rental ? `${rental.suburb}, ${rental.state} ${rental.postcode}` : "—"}
                      </Typography>
                      <Typography variant="body2">
                        Bedrooms: {rental?.bedrooms ?? "—"} <span aria-hidden="true">🛏</span> ·{" "}
                        Bathrooms: {rental?.bathrooms ?? "—"} <span aria-hidden="true">🚿</span> ·{" "}
                        Parking: {rental?.parkingSpaces ?? "—"} <span aria-hidden="true">🚗</span>
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 1, color: COLORS.darkgreen }}>
                        Average rating: {rental?.averageRating ?? "No rating"} <span aria-hidden="true">⭐</span>
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" fontWeight={600} color={COLORS.darkgreen}>
                        Your rating: {r.rating} / 5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rated on {r.dateTime ? new Date(r.dateTime).toLocaleDateString() : "Unknown date"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              aria-label="Ratings pages"
              sx={{ "& .MuiPaginationItem-root": { color: COLORS.darkgreen } }}
            />
          </Box>
        </>
      )}

      {/* Rating dialog for updating a rating */}
      {selectedProperty && (
        <RatingDialog
          property={selectedProperty}
          open={Boolean(selectedProperty)}
          onClose={() => {
            setSelectedProperty(null);
            fetchRatings(page); // re-fetch to show updated rating
          }}
        />
      )}
    </Box>
  );
}