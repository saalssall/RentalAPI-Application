import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; 
import { AppBar, Toolbar, Button, Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../images/logo.png";
import COLORS from "../constants/colors";

const NAV_LINKS = [
  { label: "About", path: "/" },
  { label: "Home", path: "/home" },
  { label: "Search", path: "/search" },
];

const activeStyle = ({ isActive }) => ({
  color: isActive ? COLORS.muted : COLORS.white,
  textDecoration: "none",
});

export default function AppNavigation() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // 👈 this was missing

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [location]); // ✅ now reactive — re-runs on every route change

  useEffect(() => {
    const handleAuth = () => setLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("authChanged", handleAuth);
    return () => window.removeEventListener("authChanged", handleAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setLoggedIn(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: COLORS.darkgreen }}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        <Box component={NavLink} to="/">
          <Box component="img" src={logo} alt="Rental Search" sx={{ height: 100 }} />
        </Box>

        <Box component="form" onSubmit={handleSearch} sx={{
          display: "flex", alignItems: "center",
          backgroundColor: COLORS.greyish, borderRadius: 2,
          px: 2, py: 0.5, flex: 1, maxWidth: 400,
        }}>
          <SearchIcon sx={{ color: COLORS.white, mr: 1 }} />
          <InputBase
            placeholder="Search properties..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ color: COLORS.white, flex: 1, "& ::placeholder": { color: COLORS.greyish } }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {NAV_LINKS.map(({ label, path }) => (
            <Button key={label} component={NavLink} to={path} style={activeStyle}>
              {label}
            </Button>
          ))}
          {loggedIn ? (
            <>
              <Button component={NavLink} to="/my-ratings" style={activeStyle}>My Ratings</Button>
              <Button sx={{ color: COLORS.white }} onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button component={NavLink} to="/register" style={activeStyle}>Register</Button>
              <Button component={NavLink} to="/login" style={activeStyle}>Login</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}