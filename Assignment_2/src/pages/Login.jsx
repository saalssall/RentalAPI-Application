import { useState } from "react";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";

export default function Login() {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
// ── Login Function ──────────────────────────────────────────
  function login() {
    fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue, password: passwordValue }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          setError(res.message);
          setSuccess(null);
        } else {
          setError(null);
          setSuccess("Login successful");
          if (res.token) {
            localStorage.setItem("token", res.token);
            navigate("/");
          }
        }
      });
  }

  return (
    <Box sx={{ backgroundColor: COLORS.light, minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{ backgroundColor: COLORS.white, display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 400, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" textAlign="center" fontWeight={700} color={COLORS.dark}>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField label="Email" type="text" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} fullWidth />
        <Button variant="contained" onClick={login} fullWidth sx={{ backgroundColor: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.yellow } }}>
          Submit
        </Button>
        <Typography textAlign="center">
          Not a member?{" "}
          <Link to="/register" style={{ color: COLORS.darkgreen, fontWeight: 600 }}>Click here to register now!</Link>
        </Typography>
      </Box>
    </Box>
  );
}