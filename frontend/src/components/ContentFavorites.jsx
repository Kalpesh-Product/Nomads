import { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import useContentFavorites from "../hooks/useContentFavorites";
import { HighlightCard } from "./AiDestinationHighlightSection";

const labels = { blog: "Blogs", news: "News", place: "Places", event: "Events" };

const toFavoriteHighlight = (item, kind) => ({
  ...item,
  id: item._id,
  title: item.mainTitle || item.eventName || item.placeName || item.title,
  image: item.mainImage || item.image,
  location: kind === "blog" || kind === "news"
    ? item.author || item.source || (kind === "blog" ? "Author" : "Source")
    : item.address || item.venue || item.destination,
  meta: kind === "event" ? item.month : kind === "place" ? item.rating
    : item.date && !Number.isNaN(new Date(item.date).getTime())
      ? new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replaceAll("/", "-") : item.date || "",
  description: item.mainContent || item.shortDescription || item.description,
});

export default function ContentFavorites({ showRemoveFavoriteIcons }) {
  const { favorites, isLoading, isError, refetch } = useContentFavorites();
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const openFavorite = (item, kind) => {
    const selectedStateLabel = item.destination || "Destination";
    if (kind === "event" || kind === "place") {
      navigate(`/${kind === "event" ? "events" : "places"}/${item._id}`, {
        state: { item, selectedStateLabel },
      });
    } else {
      navigate(kind === "news" ? "/news/news-details" : "/blog/blog-details", {
        state: { content: item, selectedStateLabel },
      });
    }
  };
  if (isLoading) return <div className="mt-10 text-center text-gray-500">Loading favorites...</div>;
  if (isError) return (
    <div className="mt-10 text-center text-red-500">
      Could not load favorite blogs, news, places and events.
      <button type="button" className="ml-2 underline" onClick={() => refetch()}>Retry</button>
    </div>
  );
  return Object.entries(labels).map(([kind, label]) => {
    const items = favorites.filter((favorite) => favorite.kind === kind);
    return (
      <div key={kind}>
        <hr className="my-10 border-gray-200" />
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-secondary-dark">
          <span>Favorite {label}</span>
          <AiFillHeart className="text-[#ff5757]" size={24} />
        </h2>
        {items.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {(expanded[kind] ? items : items.slice(0, 5)).map(({ item }) => (
              <HighlightCard key={item._id} item={toFavoriteHighlight(item, kind)} kind={kind}
                onClick={(card) => openFavorite(card, kind)} showRemoveFavoriteIcon={showRemoveFavoriteIcons} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dotted p-6 text-center text-gray-500">
            You haven't liked any {label.toLowerCase()} yet.
          </div>
        )}
        {items.length > 5 && (
          <div className="mt-6 flex justify-end">
            <button type="button" className="text-sm font-semibold text-black"
              onClick={() => setExpanded((previous) => ({ ...previous, [kind]: !previous[kind] }))}>
              {expanded[kind] ? "Show less" : "View more →"}
            </button>
          </div>
        )}
      </div>
    );
  });
}
