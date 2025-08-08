import { useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  MarkerClusterer,
} from "@react-google-maps/api";
import renderStars from "../utils/renderStarts";
import { FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

// const center = {
//   lat: 15.501,
//   lng: 73.8294,
// };

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
};

export default function Map({ locations }) {
  const navigate = useNavigate()
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const getAverageCenter = (locs) => {
  if (!locs.length) return { lat: 15.501, lng: 73.8294 };

  const total = locs.reduce(
    (acc, loc) => {
      return {
        lat: acc.lat + loc.lat,
        lng: acc.lng + loc.lng,
      };
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / locs.length,
    lng: total.lng / locs.length,
  };
};

const center = getAverageCenter(locations);


  const [hoveredMarker, setHoveredMarker] = useState(null);

  if (!isLoaded) return <div>Loading...</div>;

  const createKey = (loc) => `${loc.lat}-${loc.lng}-${loc.id}`;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={mapOptions}
    >
      <MarkerClusterer>
        {(clusterer) =>
          locations.map((loc) => (
            <Marker
              key={createKey(loc)}
              position={{ lat: loc.lat, lng: loc.lng }}
              clusterer={clusterer}
              icon={{
                url: "/images/marker.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              onMouseOver={() => setHoveredMarker(loc.id)}
              onMouseOut={() => setHoveredMarker(null)}
              onClick={()=> navigate(`${loc.name}`,{state:{
                companyId : loc?._id,
                type : loc?.type
              }})}
            >
              {hoveredMarker === loc.id && (
                <InfoWindow position={{ lat: loc.lat, lng: loc.lng }}>
                  <div className="w-40 max-w-[160px] rounded-xl shadow-md bg-white p-0 preset">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <div className="flex flex-row items-center justify-between">
                      <div className="mt-1 font-semibold text-xs text-black truncate">
                        {loc.name}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs ">
                    <FaStar />
                        <span className="text-gray-600">{loc.ratings || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-600 font-semibold">
                        {loc.location}
                      </span>
                      <span className="text-black font-semibold">
                        Reviews(
                        <span className="font-bold">{loc.reviews || 0}</span>)
                      </span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))
        }
      </MarkerClusterer>
    </GoogleMap>
  );
}
