import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Button, Typography, Alert, Box, Tabs, Tab,
} from "@mui/material";
import PropertyMap from "./Map";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";
import { saveRating } from "../helpers/ratings";

export default function RatingDialog({ property, open, onClose }) {
  const [tab, setTab] = useState(0);
  const [rating, setRating] = useState(0);
  const [existingRating, setExistingRating] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's existing rating when dialog opens
  useEffect(() => {
    if (!open || !property) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/rentals/${property.id}/ratings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => {
        if (!json.error) {
          setExistingRating(json.rating);
          setRating(json.rating);
        }
      })
      .catch(() => {});
  }, [open, property]);

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) { setError("You must be logged in to rate a property."); return; }

    try {
      const res = await fetch(`${API_URL}/rentals/${property.id}/ratings`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      setSuccess(true);
      setExistingRating(rating);
      setError(null);
      saveRating(property, rating);
    } catch (err) {
      setError(err.message || "Failed to submit rating.");
    }
  }

  function handleClose() {
    setRating(0); setSuccess(false); setError(null);
    setTab(0); setExistingRating(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: COLORS.darkpink, fontWeight: 700 }}>
        {property?.title}
      </DialogTitle>

      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Rate" />
        <Tab label="Map" />
      </Tabs>

      <DialogContent>
        {tab === 0 && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              📍 {property?.suburb}, {property?.state} {property?.postcode}
            </Typography>

            {/* Show average rating */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ⭐ Average rating: {property?.averageRating ?? "No ratings yet"} ({property?.numRatings ?? 0} reviews)
            </Typography>

            {/* Show existing rating */}
            {existingRating && !success && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You previously rated this property {existingRating} star{existingRating !== 1 ? "s" : ""}. Submitting will update your rating.
              </Alert>
            )}

            {success ? (
              <Alert severity="success">Rating submitted successfully!</Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {existingRating ? "Update your rating:" : "Select your rating:"}
                </Typography>
                <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} size="large" />
              </>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ height: 350, width: "100%", mt: 1 }}>
            <PropertyMap property={property} />
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