import { Box, Typography, Link, Grid } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ backgroundColor: "#1B4332", color: "#FFFFFF", p: 4, mt: "auto" }}>
      <Grid container spacing={4}>

        {/* Brand */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight={700}>Rental Search</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#A8D5A2" }}>
            Find your perfect rental property across Australia.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight={700}>Quick Links</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            <Link href="/" color="inherit">About</Link>
            <Link href="/home" color="inherit">Home</Link>
            <Link href="/search" color="inherit">Search</Link>
          </Box>
        </Grid>

        {/* Contact */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" fontWeight={700}>Contact</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#A8D5A2" }}>
            📧 info@rentalsearch.com.au
          </Typography>
          <Typography variant="body2" sx={{ color: "#A8D5A2" }}>
            📞 +61 7 1234 5678
          </Typography>
          <Typography variant="body2" sx={{ color: "#A8D5A2" }}>
            📍 Brisbane, QLD, Australia
          </Typography>
        </Grid>

      </Grid>

      {/* Copyright */}
      <Box sx={{ borderTop: "1px solid #A8D5A2", mt: 3, pt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#A8D5A2" }}>
          © 2026 Hamidullah Rezae. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}