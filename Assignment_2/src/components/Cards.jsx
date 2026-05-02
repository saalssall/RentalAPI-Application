import image1 from "../images/home_page.jpg";
import image2 from "../images/image_2.jpg";
import image3 from "../images/image_3.jpg";
import COLORS from "../constants/colors";

import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

//Dummy data for demonstration purposes. 
const properties = [
  {
    id: 1,
    title: "3 Bedroom House",
    location: "Brisbane, QLD",
    price: "$450/week",
    beds: 3,
    baths: 2,
    image: image1,
  },
  {
    id: 2,
    title: "2 Bedroom Apartment",
    location: "Sydney, NSW",
    price: "$550/week",
    beds: 2,
    baths: 1,
    image: image2,
  },
  {
    id: 3,
    title: "4 Bedroom Villa",
    location: "Melbourne, VIC",
    price: "$750/week",
    beds: 4,
    baths: 3,
    image: image3,
  },
];

function PropertyCard({ title, location, price, beds, baths, image }) {
  return (
    <Card sx={{ maxWidth: 345, boxShadow: 3, borderRadius: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={title}
      />
      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {location}
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
          {price}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          🛏 {beds} beds &nbsp; 🚿 {baths} baths
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" sx={{ backgroundColor: COLORS.darkgreen }}>
          View Details
        </Button>
        <Button size="small" variant="outlined" sx={{ borderColor: COLORS.darkgreen, color: COLORS.darkgreen }}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}

export default function PropertyCards() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3, color: COLORS.darkgreen }}>
        Available Properties
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard {...property} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

//To do:
//Make this functional by fetching real data from the backend and implementing pagination, filtering, and sorting.