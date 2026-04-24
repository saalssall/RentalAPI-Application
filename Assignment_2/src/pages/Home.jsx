import React from "react"
import {Box} from "@mui/material";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import Cards from "../components/Cards";

function Home() {
  return (
    <main>
      <Hero />
      <Box
        component="img"
        src="/images/home_page.jpg"
        alt="Icon"
        sx={{ width: "100%", height: "100vh", objectFit: "cover", display: "block" }}
      />
      <Cards />
    </main>
  )
}

const Hero = () => (
  <section className="hero">
    <div className="hero__content">
      <h1 className="hero__title">Rental Search</h1>
      <p className="hero__subtitle">
        Welcome to the Rental Search portal. Click on Properties to see
        the available listings, or choose Filters to narrow down your search.
      </p>
    </div>
  </section>
)

export default Home