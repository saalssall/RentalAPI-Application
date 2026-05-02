import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardContent, Divider,
  Alert, CircularProgress, Button, Chip, Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API_URL from "../constants/api";
import COLORS from "../constants/colors";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (property) document.title = `${property.title} | Rental Search`;
  }, [property]);

  useEffect(() => {
    fetch(`${API_URL}/rentals/${id}`, {
      headers: { accept: "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Property not found.");
        return res.json();
      })
      .then(json => { setProperty(json); setLoading(false); })
      .catch(err => { setError(err.message || "Failed to load property."); setLoading(false); });
  }, [id]);

  if (loading) return (
    <Box role="status" aria-live="polite"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress aria-label="Loading property details" sx={{ color: COLORS.darkgreen }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" role="alert">{error}</Alert>
    </Box>
  );

  const amenitiesList = property.amenities
    ? property.amenities.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <Box sx={{ p: 4, backgroundColor: COLORS.light, minHeight: "100vh" }}>

      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}
        sx={{ mb: 3, color: COLORS.darkgreen, "&:hover": { backgroundColor: COLORS.light } }}>
        Back
      </Button>

      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color={COLORS.darkgreen}>{property.title}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            <span aria-hidden="true">📍</span> {property.streetAddress}, {property.suburb}, {property.state} {property.postcode}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography variant="h5" fontWeight={700} color={COLORS.darkgreen}>${property.rent}/week</Typography>
          <Typography variant="body2" color="text.secondary">Listed by {property.agencyName}</Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={() => setRatingOpen(true)}
        sx={{
          mt: 2,
          backgroundColor: COLORS.darkgreen,
          "&:hover": { backgroundColor: COLORS.muted }
        }}
      >
        Rate this Property
      </Button>
      

      {/* AG Grid Table */}
      <Typography variant="subtitle1" fontWeight={700} color={COLORS.darkgreen} sx={{ mb: 1 }}>
        Property Details
      </Typography>
      <div className="ag-theme-quartz" style={{ width: "100%", marginBottom: "24px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <AgGridReact
          rowData={[
            { field: "🏠 Type", value: property.propertyType },
            { field: "📍 Address", value: `${property.streetAddress}, ${property.suburb}, ${property.state} ${property.postcode}` },
            { field: "🌏 Locality", value: property.locality },
            { field: "🛏 Bedrooms", value: property.bedrooms },
            { field: "🚿 Bathrooms", value: property.bathrooms },
            { field: "🚗 Parking", value: property.parkingSpaces },
            { field: "💰 Rent", value: `$${property.rent}/week` },
            { field: "🏢 Agency", value: property.agencyName },
            { field: "✨ Amenities", value: property.amenities ?? "—" },
            { field: "⭐ Rating", value: property.averageRating ? `${property.averageRating} / 5 (${property.numRatings} reviews)` : "No ratings yet" },
          ]}
          columnDefs={[
            {
              field: "field",
              headerName: "Field",
              flex: 1,
              cellStyle: {
                fontWeight: "700",
                color: COLORS.darkgreen,
                display: "flex",
                alignItems: "center",
                fontSize: "13px",
              },
            },
            {
              field: "value",
              headerName: "Details",
              flex: 2,
              wrapText: true,
              autoHeight: true,
              cellStyle: {
                color: "#444",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.5",
              },
            },
          ]}
          defaultColDef={{ resizable: false, sortable: false }}
          domLayout="autoHeight"
          rowStyle={{ cursor: "default" }}
          getRowStyle={(params) => ({
            backgroundColor: params.rowIndex % 2 === 0 ? "#f8fdf8" : "#ffffff",
          })}
          headerHeight={40}
          rowHeight={44}
        />
      </div>

      {/* Description */}
      {property.description && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color={COLORS.darkgreen} sx={{ mb: 1 }}>
            Description
          </Typography>
          <Box sx={{
            p: 2,
            backgroundColor: "#f8fdf8",
            borderRadius: 2,
            border: `1px solid ${COLORS.darkgreen}30`,
            maxHeight: 300,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { backgroundColor: "#f0f0f0", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: COLORS.darkgreen, borderRadius: "10px" },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: property.description }} />
          </Box>
        </Box>
      )}

    </Box>
  );
}