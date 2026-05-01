import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Button, Typography, Alert, Box, Tabs, Tab,
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

  useEffect(() => {
    if (!open || !property) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/ratings/rentals/${property.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) return; // No existing rating, silently ignore
        return res.json();
      })
      .then(json => {
        if (json?.rating) {
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

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ⭐ Average rating: {property?.averageRating ?? "No ratings yet"} ({property?.numRatings ?? 0} reviews)
            </Typography>

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