import { Box, Typography, Grid, Card, CardContent, Divider, Alert } from "@mui/material";
import { getSavedRatings } from "../helpers/ratings";
import COLORS from "../constants/colors";

// ── My Ratings Page ──────────────────────────────────────────
export default function MyRatings() {
    const ratings = getSavedRatings();

    return (
        <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={700} color={COLORS.darkgreen} sx={{ mb: 3 }}>
                My Ratings
            </Typography>

            {ratings.length === 0 ? (
                <Alert severity="info">You haven't rated any properties yet.</Alert>
            ) : (
                <Grid container spacing={2}>
                    {ratings.map((r) => (
                        <Grid item xs={12} sm={6} md={3} key={r.id}>
                            <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={700} color={COLORS.darkgreen}>{r.title}</Typography>
                                    <Typography variant="body2" fontWeight={600} color={COLORS.darkgreen}>${r.rent}/week</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2">🏠 {r.propertyType}</Typography>
                                    <Typography variant="body2">📍 {r.suburb}, {r.state} {r.postcode}</Typography>
                                    <Typography variant="body2">🛏 {r.bedrooms} · 🚿 {r.bathrooms} · 🚗 {r.parkingSpaces}</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1, color: COLORS.darkgreen }}>
                                        ⭐ {r.averageRating ?? "No rating"}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" fontWeight={600} color={COLORS.darkgreen}>
                                        Your rating: {r.rating} / 5
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Rated on {new Date(r.dateTime).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}