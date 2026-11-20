import { MapPin } from "lucide-react";
import Map from "./Map";

export const PlaceAddress = ({ address }) =>
  address ? (
    <p className="mt-2 flex items-start gap-2 text-base font-medium text-black">
      <MapPin size={17} className="mt-1 shrink-0" />
      <span>Address: {address}</span>
    </p>
  ) : null;

const toCoordinate = (value, limit) => {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
};

export default function PlaceLocation({ item }) {
  const lat = toCoordinate(item.latitude ?? item.lat, 90);
  const lng = toCoordinate(item.longitude ?? item.lng, 180);
  if (lat === null || lng === null) return null;

  const mapsLink = item.googleMapsLink?.trim();
  const locations = [{
    id: item._id || item.id || "place-preview",
    lat,
    lng,
    name: item.placeName || item.title,
    location: item.destination || item.region || item.address,
    ratings: item.rating || item.meta,
    image: item.mainImage || item.image,
    googleMap: mapsLink,
  }];

  return (
    <section className="mt-5 w-full border-b border-gray-200 pb-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title font-medium uppercase text-gray-700">
          Where you'll be
        </h2>
        {mapsLink && (
          <a href={mapsLink} target="_blank" rel="noreferrer" className="font-medium text-blue-600 underline">
            Get Direction
          </a>
        )}
      </div>
      <div className="h-[410px] w-full overflow-hidden rounded-xl">
        <Map locations={locations} disableNavigation disableTwoFingerScroll />
      </div>
    </section>
  );
}
