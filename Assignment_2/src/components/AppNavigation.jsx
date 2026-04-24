import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AuthenticatedRoute from "./AuthRoute";

import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Box,
} from "@mui/material";

const navLinks = [
  { label: "About", path: "/" },
  { label: "Home", path: "/home" },
  { label: "Search", path: "/search" },
];

export default function AppNavigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [location]); 
  
  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    handleCloseMenu();
  };

  const activeStyle = ({ isActive }) => ({
    color: isActive ? "yellow" : "white",
    textDecoration: "none",
  });

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1B4332" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
  
        {/* Brand */}
        <Typography
          variant="h6"
          component={NavLink}
          to="/"
          sx={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
        >
          Rental Search
        </Typography>

        {/* Desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
          {navLinks.map(({ label, path }) => (
            <Button
              key={label}
              component={NavLink}
              to={path}
              style={activeStyle}
            >
              {label}
            </Button>
          ))}

          {!loggedIn ? (
            <>
              <Button component={NavLink} to="/register" style={activeStyle}>Register</Button>
              <Button component={NavLink} to="/login" style={activeStyle}>Login</Button>
            </>
          ) : (
            <Button sx={{ color: "white" }} onClick={handleLogout}>Logout</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
