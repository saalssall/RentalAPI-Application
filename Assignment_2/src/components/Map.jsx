import { Map, Marker } from "pigeon-maps";

export default function PropertyMap({ property }) {
  if (!property?.latitude || !property?.longitude) {
    return <p>No location available.</p>;
  }

  const center = [property.latitude, property.longitude];

  return (
    <Map
      center={center}
      zoom={15}
      height={350}
      style={{ borderRadius: "8px" }}
    >
      <Marker
        anchor={center}
        color="#1B4332"
      />
    </Map>
  );
}