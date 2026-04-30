import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Link } from "react-router-dom";
import heroImage from "../images/pic_about_page.jpg";
import COLORS from "../constants/colors";

// ── Features Data ──────────────────────────────────────────
const features = [
  { icon: <SearchIcon />, title: "Advanced Search", description: "Search by property ID, type, state, and rating.", path: "/advanced-search" },
  { icon: <HomeIcon />, title: "Property Types", description: "Houses, apartments, villas and more.", path: "/search" },
  { icon: <LocationOnIcon />, title: "Search by State", description: "Filter across all Australian states.", path: "/search" },
  { icon: <StarIcon />, title: "Ratings", description: "Find top-rated properties by verified reviews.", path: "/search" },
];

// ── Hero Section ──────────────────────────────────────────
const Hero = () => (
  <Box sx={{
    height: "100vh", position: "relative",
    backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center",
    display: "flex", alignItems: "center", px: { xs: 4, md: 10 },
  }}>
    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.6), transparent)", pointerEvents: "none" }} />
    <Box sx={{ position: "relative", color: COLORS.white, maxWidth: 520 }}>
      <Typography variant="overline" sx={{ letterSpacing: 3, color: COLORS.muted }}>About Us</Typography>
      <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 3, lineHeight: 1.2 }} color={COLORS.yellow}>
        Finding home shouldn't be hard.
      </Typography>
      <Typography variant="body1" sx={{ lineHeight: 1.9, opacity: 0.9 }}>
        Rental Search was built for Australians tired of endless tabs and outdated listings.
        Thousands of verified properties, searchable by location, type, and rating —
        so you spend less time looking and more time living.
      </Typography>
    </Box>
  </Box>
);

// ── Features & Benefits ──────────────────────────────────────────
const Features = () => (
  <Box sx={{ py: 6, px: 4, backgroundColor: COLORS.light }}>
    <Typography variant="h5" fontWeight={700} textAlign="center" color={COLORS.dark} sx={{ mb: 4 }}>
      Why Use Rental Search?
    </Typography>
    <Grid container spacing={3} justifyContent="center" alignItems="stretch">
      {features.map(({ icon, title, description, path }) => (
        <Grid item xs={12} sm={6} md={3} key={title}>
          <Card
            component={path ? Link : "div"}
            to={path ?? ""}
            sx={{
              textAlign: "center", p: 2, borderRadius: 3, boxShadow: 2,
              textDecoration: "none", color: "inherit",
              backgroundColor: COLORS.white,
              display: "block",
              height: "100%",
              "&:hover": { boxShadow: 6, transform: "translateY(-4px)", transition: "0.3s" },
              ...(path && { cursor: "pointer" }),
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
);

// ── Call to Action ────────────────
const CTA = () => (
  <Box sx={{ backgroundColor: COLORS.dark, color: COLORS.white, py: 6, textAlign: "center" }}>
    <Typography variant="h5" fontWeight={700} sx={{ color: COLORS.darkgreen }}>
      Ready to Find Your Next Home?
    </Typography>
    <Typography sx={{ color: COLORS.darkgreen, mt: 1, mb: 3 }}>
      Search thousands of properties across Australia.
    </Typography>
    <Box component={Link} to="/search" sx={{
      backgroundColor: COLORS.light, color: COLORS.darkgreen,
      px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, textDecoration: "none",
      "&:hover": { backgroundColor: COLORS.light },
    }}>
      Search Properties
    </Box>
  </Box>
);

export default function About() {
  return (
    <Box>
      <Hero />
      <Features />
      <CTA />
    </Box>
  );
}