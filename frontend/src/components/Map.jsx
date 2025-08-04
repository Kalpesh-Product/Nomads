import { useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

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

export default function Map({ locations }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const [hoveredMarker, setHoveredMarker] = useState(null);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {locations.map((loc) => (
        <Marker
          icon={{
            url: "/images/marker.png", // must use `url`, not `path`
            scaledSize: new window.google.maps.Size(40, 40), // optional: resize icon
          }}
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          onMouseOver={() => setHoveredMarker(loc.id)}
          onMouseOut={() => setHoveredMarker(null)}
          options={mapOptions}
        >
          {hoveredMarker === loc.id && (
            // <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
            //   <div>{loc.label}</div>
            // </InfoWindow>
            <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
              <div className="w-40 max-w-[160px] rounded-xl shadow-md bg-white pl-1 preset">
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
                    <span className="ml-1 text-gray-600">{loc.rating}</span>
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
