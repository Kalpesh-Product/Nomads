import { useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

// Set the default center of the map
const locations = [
  { id: 1, lat: 15.501, lng: 73.8294, label: "Location A" },
  { id: 2, lat: 15.492, lng: 73.8235, label: "Location B" },
  { id: 3, lat: 15.515, lng: 73.84, label: "Location C" },
];

const center = {
  lat: 15.501,
  lng: 73.8294,
};

const containerStyle = {
  width: "50%",
  height: "50%",
};

const mapOptions = {
  disableDefaultUI : false
};

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const [hoveredMarker, setHoveredMarker] = useState(null);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          onMouseOver={() => setHoveredMarker(loc.id)}
          onMouseOut={() => setHoveredMarker(null)}
          options={mapOptions}
        >
          {hoveredMarker === loc.id && (
            <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
              <div>{loc.label}</div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
