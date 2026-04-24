import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Button, Typography, Alert,
} from "@mui/material";

const API_URL = "http://4.237.58.241:3000";
const COLORS = { dark: "#1B4332" };

export default function RatingDialog({ property, open, onClose }) {
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
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: COLORS.dark, fontWeight: 700 }}>
        Rate Property
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>{property?.title}</Typography>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: COLORS.dark }}>Close</Button>
        {!success && (
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