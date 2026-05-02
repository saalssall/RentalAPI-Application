import { Box, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import Cards from "../components/Cards";
import COLORS from "../constants/colors";
import heroImage from "../images/pic_home.jpeg";
import Logo from "../images/logo.png";



// ── Hero Section ──────────────────────────────────────────
const Hero = () => (
  <Box sx={{
    position: "relative", height: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
  }}>
    <Box component="img" src={heroImage} alt="Rental property"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <Box sx={{ position: "absolute", inset: 0, bgcolor: COLORS.pinkish }} />
    <Box sx={{ position: "relative", zIndex: 1, color: COLORS.white, px: 2 }}>
      <Typography variant="h2" fontWeight={700} gutterBottom color={COLORS.white}>
        Find Your Next Rental
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, opacity: 0.85 }}>
        Browse available listings or narrow down your search with filters.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" size="large" component={Link} to="/search"
          sx={{ backgroundColor: COLORS.darkgreen, color: COLORS.dark }}>
          View Properties
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/search"
          sx={{ color: COLORS.white, borderColor: COLORS.white }}>
          Filters
        </Button>
      </Stack>
    </Box>
  </Box>
);

export default function Home() {
  return (
    <main>
      <Hero />
      <Box sx={{ p: 4 }}>
        <Cards />
      </Box>
    </main>
  );
}