import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Button, Typography, Alert, Box, Tabs, Tab,
} from "@mui/material";
import PropertyMap from "./Map";

const API_URL = "http://4.237.58.241:3000";
const COLORS = { dark: "#1B4332" };

export default function RatingDialog({ property, open, onClose }) {
  const [tab, setTab] = useState(0);
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to rate a property.");
      return;
    }
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
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to submit rating.");
    }
  }

  function handleClose() {
    setRating(0);
    setSuccess(false);
    setError(null);
    setTab(0);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: COLORS.dark, fontWeight: 700 }}>
        {property?.title}
      </DialogTitle>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, newTab) => setTab(newTab)}
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Rate" />
        <Tab label="Map" />
      </Tabs>

      <DialogContent>
        {/* Rate Tab */}
        {tab === 0 && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              📍 {property?.suburb}, {property?.state} {property?.postcode}
            </Typography>
            {success ? (
              <Alert severity="success">Rating submitted successfully!</Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Typography variant="body2" sx={{ mb: 1 }}>Select your rating:</Typography>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                  size="large"
                />
              </>
            )}
          </Box>
        )}

        {/* Map Tab */}
        {tab === 1 && (
          <Box sx={{ height: 350, width: "100%", mt: 1 }}>
            <PropertyMap property={property} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} sx={{ color: COLORS.dark }}>Close</Button>
        {tab === 0 && !success && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={rating === 0}
            sx={{ backgroundColor: COLORS.dark }}
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}