import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const features = [
  { icon: <SearchIcon />, title: "Advanced Search", description: "Search by property ID, type, state, and rating." },
  { icon: <HomeIcon />, title: "Property Types", description: "Houses, apartments, villas and more." },
  { icon: <LocationOnIcon />, title: "Search by State", description: "Filter across all Australian states." },
  { icon: <StarIcon />, title: "Ratings", description: "Find top-rated properties by verified reviews." },
];

const COLORS = {
  dark: "#431b34",
  light: "#D4EDBA",
  muted: "#A8D5A2",
};

export default function About() {
  return (
    <Box>
    {/* CTA */}
      <Box sx={{ backgroundColor: COLORS.dark, color: "#fff", py: 6, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700}>Ready to Find Your Next Home?</Typography>
        <Typography sx={{ color: COLORS.muted, mt: 1, mb: 3 }}>
          Search thousands of properties across Australia.
        </Typography>
        <Box component="a" href="/search" sx={{
          backgroundColor: COLORS.light, color: COLORS.dark,
          px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, textDecoration: "none",
          "&:hover": { backgroundColor: COLORS.muted },
        }}>
          Search Properties
        </Box>
      </Box>
      {/* Features */}
      <Box sx={{ py: 6, px: 4, backgroundColor: COLORS.light }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" color={COLORS.dark} sx={{ mb: 4 }}>
          Why Use Rental Search?
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {features.map(({ icon, title, description }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Card sx={{ textAlign: "center", p: 2, borderRadius: 3, boxShadow: 2,
                "&:hover": { boxShadow: 6, transform: "translateY(-4px)", transition: "0.3s" }
              }}>
                <CardContent>
                  <Box sx={{ color: COLORS.dark, mb: 1 }}>{icon}</Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.dark}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}