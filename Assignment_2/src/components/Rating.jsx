import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Button, Typography, Alert, Box, Tabs, Tab, Divider, CircularProgress,
} from "@mui/material";
import PropertyMap from "./Map";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";

export default function RatingDialog({ property, open, onClose }) {
  const [tab, setTab] = useState(0);
  const [rating, setRating] = useState(0);
  const [existingRating, setExistingRating] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [fullProperty, setFullProperty] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch full property details when dialog opens
  useEffect(() => {
    if (!open || !property) return;
    setLoadingDetails(true);
    fetch(`${API_URL}/rentals/${property.id}`, {
      headers: { accept: "application/json" }
    })
      .then(res => res.ok ? res.json() : null)
      .then(json => { if (json) setFullProperty(json); })
      .catch(() => { })
      .finally(() => setLoadingDetails(false));
  }, [open, property]);

  // Fetch existing rating when dialog opens
  useEffect(() => {
    if (!open || !property) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/ratings/rentals/${property.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) return;
        return res.json();
      })
      .then(json => {
        if (json?.rating) {
          setExistingRating(json.rating);
          setRating(json.rating);
        }
      })
      .catch(() => { });
  }, [open, property]);

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) { setError("You must be logged in to rate a property."); return; }

    try {
      const res = await fetch(`${API_URL}/ratings/rentals/${property.id}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to submit rating.");
      setSuccess(true);
      setExistingRating(rating);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to submit rating.");
    }
  }

  function handleClose() {
    setRating(0); setSuccess(false); setError(null);
    setTab(0); setExistingRating(null); setFullProperty(null);
    onClose();
  }

  // Use full property details if available, fall back to prop
  const p = fullProperty ?? property;

  const amenitiesList = p?.amenities
    ? p.amenities.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      aria-labelledby="rating-dialog-title">
      <DialogTitle id="rating-dialog-title" sx={{ color: COLORS.darkpink, fontWeight: 700 }}>
        {p?.title}
      </DialogTitle>

      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Rate" />
        <Tab label="Details" />
        <Tab label="Map" />
      </Tabs>

      <DialogContent>

        {/* Rate Tab */}
        {tab === 0 && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <span aria-hidden="true">📍</span> {p?.suburb}, {p?.state} {p?.postcode}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Average rating: {p?.averageRating ?? "No ratings yet"} <span aria-hidden="true">⭐</span> ({p?.numRatings ?? 0} reviews)
            </Typography>

            {existingRating && !success && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You previously rated this property {existingRating} star{existingRating !== 1 ? "s" : ""}. Submitting will update your rating.
              </Alert>
            )}

            {success ? (
              <Alert severity="success" role="alert">Rating submitted successfully!</Alert>
            ) : (
              <>
                {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {existingRating ? "Update your rating:" : "Select your rating:"}
                </Typography>
                <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} size="large" />
              </>
            )}
          </Box>
        )}

        {/* Details Tab */}
        {tab === 1 && (
          <Box sx={{ pt: 1 }}>
            {loadingDetails ? (
              <Box role="status" aria-live="polite" sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress aria-label="Loading property details" sx={{ color: COLORS.darkgreen }} />
              </Box>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Title:</strong> <span aria-hidden="true"></span> {p?.title} ·{" "}
                  <strong>Type:</strong> <span aria-hidden="true">🏠</span> {p?.propertyType}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Address:</strong> {p?.streetAddress}, {p?.suburb}, {p?.state} {p?.postcode}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>

                  Bedrooms: {p?.bedrooms} <span aria-hidden="true">🛏</span> ·{" "}
                  Bathrooms: {p?.bathrooms} <span aria-hidden="true">🚿</span> ·{" "}
                  Parking: {p?.parkingSpaces} <span aria-hidden="true">🚗</span> ·{" "}
                  Number of Ratings: {p?.numRatings ?? 0} <span aria-hidden="true">⭐</span> ·{" "}
                  Average Rating: {p?.averageRating ?? "No ratings yet"} <span aria-hidden="true">⭐</span> ·{" "}
                  Rent: {p?.rent ? `$${p.rent}/week` : "N/A"}

                </Typography>
                {p?.agencyName && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Agency:</strong> {p.agencyName}
                  </Typography>
                )}
                {amenitiesList.length > 0 && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Amenities:</strong> {amenitiesList.join(" · ")}
                  </Typography>
                )}
                {p?.description && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary"
                      sx={{ lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: p.description }} />
                  </>
                )}
              </>
            )}
          </Box>
        )}

        {/* Map Tab */}
        {tab === 2 && (
          <Box sx={{ height: 350, width: "100%", mt: 1 }}>
            <PropertyMap property={p} />
            <div>
              Latitude: {p?.latitude}, Longitude: {p?.longitude}
            </div>
          </Box>
        )}


      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}
          sx={{ color: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.light } }}>
          Close
        </Button>
        {tab === 0 && !success && (
          <Button variant="contained" onClick={handleSubmit} disabled={rating === 0}
            sx={{ backgroundColor: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.muted } }}>
            {existingRating ? "Update Rating" : "Submit"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}