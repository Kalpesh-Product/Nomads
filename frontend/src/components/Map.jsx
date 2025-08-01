import { useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

// Set the default center of the map
// const locations = [
//   { id: 1, lat: 15.501, lng: 73.8294, label: "Location A" },
//   { id: 2, lat: 15.492, lng: 73.8235, label: "Location B" },
//   { id: 3, lat: 15.515, lng: 73.84, label: "Location C" },
// ];
const locations = [
  {
    id: 1,
    lat: 15.501,
    lng: 73.8294,
    name: "BIZ Nest",
    location: "Panaji",
    reviews: 20,
    rating: 4.0,
    image:
      "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
  },
  {
    id: 2,
    lat: 15.492,
    lng: 73.8235,
    name: "MeWo",
    location: "Panaji",
    reviews: 20,
    rating: 3.5,
    image:
      "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
  },
  {
    id: 3,
    lat: 15.515,
    lng: 73.84,
    name: "Livv",
    location: "Panaji",
    reviews: 20,
    rating: 5.0,
    image:
      "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
  },
];

const center = {
  lat: 15.501,
  lng: 73.8294,
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
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
          options={mapOptions}>
          {hoveredMarker === loc.id && (
            // <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
            //   <div>{loc.label}</div>
            // </InfoWindow>
            <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
              <div className="w-40 max-w-[160px] rounded-xl shadow-md bg-white pl-1">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-20 object-cover rounded-md"
                />
                <div className="flex flex-row items-center justify-between">
                  <div className="mt-1 font-semibold text-xs text-black truncate">
                    {loc.name}
                  </div>

                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-yellow-400 text-sm leading-none">
                      {"★".repeat(Math.floor(loc.rating)) +
                        "☆".repeat(5 - Math.floor(loc.rating))}
                    </span>
                    <span className="ml-1 text-gray-600">
                      {loc.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-gray-600 font-semibold">
                    {loc.location}
                  </span>
                  <span className="text-black font-semibold">
                    Reviews(<span className="font-bold">{loc.reviews}</span>)
                  </span>
                </div>

                {/* <button className="mt-2 w-full border border-black text-[11px] text-black py-[3px] rounded-full font-semibold hover:bg-black hover:text-white transition">
                  BOOK
                </button> */}
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
