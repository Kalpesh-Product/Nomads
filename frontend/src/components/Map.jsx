import React, { useMemo, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  MarkerClusterer,
} from "@react-google-maps/api";
import { FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const FALLBACK_CENTER = { lat: 15.501, lng: 73.8294 };
const CONTAINER_STYLE = { width: "100%", height: "100%" };

// --- Helpers ---
const isValidCoord = (n) => typeof n === "number" && Number.isFinite(n);

/** Average center of all valid coords. */
function getAverageCenter(points) {
  const valid = points.filter(
    (p) => isValidCoord(p.lat) && isValidCoord(p.lng)
  );
  if (valid.length === 0) return FALLBACK_CENTER;

  const { latSum, lngSum } = valid.reduce(
    (acc, p) => ({ latSum: acc.latSum + p.lat, lngSum: acc.lngSum + p.lng }),
    { latSum: 0, lngSum: 0 }
  );
  return { lat: latSum / valid.length, lng: lngSum / valid.length };
}

// Memoized marker item so only affected markers re-render
const MarkerItem = React.memo(function MarkerItem({
  loc,
  clusterer,
  isHovered,
  onHover,
  onLeave,
  onClick,
}) {
  const position = useMemo(() => ({ lat: loc.lat, lng: loc.lng }), [loc.lat, loc.lng]);

  return (
    <Marker
      position={position}
      clusterer={clusterer}
      onMouseOver={() => onHover(loc.id)}
      onMouseOut={() => onLeave(loc.id)}
      onClick={() => onClick(loc)}
      // Example to use a custom icon (kept commented as in your code)
      // icon={{ url: "/images/marker.png", scaledSize: new window.google.maps.Size(40, 40) }}
    >
      {isHovered && (
        <InfoWindow position={position}>
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
              <span className="text-gray-600 font-semibold">{loc.location}</span>
              <span className="text-black font-semibold">
                Reviews(<span className="font-bold">{loc.reviews || 0}</span>)
              </span>
            </div>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
});

export default function Map({
  locations = [],
  disableNavigation = false,
  disableTwoFingerScroll = false,
}) {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });
  const [hoveredId, setHoveredId] = useState(null);

  // Stable map options to avoid re-renders
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      gestureHandling: disableTwoFingerScroll ? "none" : "greedy",
    }),
    [disableTwoFingerScroll]
  );

  // Compute the map center:
  // - if 1 location -> that location
  // - if many -> average center
  // - else -> fallback
  const mapCenter = useMemo(() => {
    if (locations.length === 1) {
      const only = locations[0];
      if (isValidCoord(only.lat) && isValidCoord(only.lng)) {
        return { lat: only.lat, lng: only.lng };
      }
    }
    if (locations.length > 1) return getAverageCenter(locations);
    return FALLBACK_CENTER;
  }, [locations]);

  // Avoid no-op state updates on hover to reduce needless renders
  const handleHover = useCallback(
    (id) => {
      if (hoveredId !== id) setHoveredId(id);
    },
    [hoveredId]
  );

  const handleLeave = useCallback(
    (id) => {
      if (hoveredId === id) setHoveredId(null);
    },
    [hoveredId]
  );

  const handleMarkerClick = useCallback(
    (loc) => {
      if (!disableNavigation) {
        navigate(`/nomad/listings/${loc.name}`, {
          state: { companyId: loc?._id, type: loc?.type },
        });
      }
    },
    [disableNavigation, navigate]
  );

  // Stable list of markers with keys
  const markerData = useMemo(
    () =>
      locations
        .filter((l) => isValidCoord(l.lat) && isValidCoord(l.lng))
        .map((l) => ({
          ...l,
          _key: `${l.lat}-${l.lng}-${l.id ?? l._id ?? l.name ?? Math.random()}`,
        })),
    [locations]
  );

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={mapCenter}
      zoom={12}
      options={mapOptions}
    >
      <MarkerClusterer>
        {(clusterer) =>
          markerData.map((loc) => (
            <MarkerItem
              key={loc._key}
              loc={loc}
              clusterer={clusterer}
              isHovered={hoveredId === loc.id}
              onHover={handleHover}
              onLeave={handleLeave}
              onClick={handleMarkerClick}
            />
          ))
        }
      </MarkerClusterer>
    </GoogleMap>
  );
}
