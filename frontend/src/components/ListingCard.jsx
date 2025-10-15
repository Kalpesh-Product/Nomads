import { useState } from "react";
import {
  AiFillHeart,
  AiFillStar,
  AiOutlineHeart,
  AiTwotoneHeart,
} from "react-icons/ai";

import { useNavigate } from "react-router-dom";

const ListingCard = ({ item, handleNavigation, showVertical = true }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const typeLabels = {
    coworking: "CoWorking",
    coliving: "CoLiving",
    hostel: "Hostel",
    privatestay: "Private Stay",
    cafe: "Cafe",
    workation: "Workation",
    meetingroom: "Meeting Rooms",
  };

  const thumbnailImage = item?.images?.[0]?.url;

  return (
    <div
      onClick={handleNavigation}
      // className="flex flex-col gap-2 h-56 w-[95%] bg-white  rounded-lg  transition-all cursor-pointer">
      className="flex flex-col gap-2 w-full max-w-sm bg-white rounded-lg transition-all cursor-pointer"
    >
      {/* <div className="h-full w-full overflow-hidden rounded-3xl border-2 relative"> */}
      <div className="w-full aspect-square overflow-hidden rounded-3xl relative">
        <img
          src={
            thumbnailImage ||
            "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp"
          }
          alt={item.companyName}
          className="w-full h-full object-cover hover:scale-105 transition-all"
        />
        <div className="absolute top-2 right-2 pb-4 w-full h-full pl-0 pointer-events-none">
          <div className="flex flex-col items-end h-full justify-between">
            <button
              type="button"
              className="cursor-pointer pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation(); // ✅ stop navigation only for heart
                toggleFavorite(item._id);
              }}
            >
              {favorites.includes(item._id) ? (
                <AiFillHeart className="text-[#ff5757]" size={22} />
              ) : (
                // <AiOutlineHeart className="text-white" size={22} />
                <AiTwotoneHeart className="text-white" size={22} />
              )}
            </button>

            {showVertical && (
              <div className="bg-white rounded-lg px-2">
                <span className="font-normal text-xs leading-normal">
                  {item.companyType || "Test"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[25%] flex flex-col gap-1 pl-4 pr-1">
        <div className="flex w-full justify-between items-center">
          <div className="w-full">
            {/* Mobile: show full name */}
            <p
              className="text-sm font-semibold block sm:hidden"
              title={item.companyName || "Title"}
            >
              {item.companyName.length > 30
                ? `${item.companyName.slice(0, 18)}...`
                : item.companyName || "title"}
            </p>

            {/* Tablet/Desktop: show truncated */}
            <p
              className="text-sm font-semibold hidden sm:block"
              title={item.companyName || "title"}
            >
              {{
                showVertical:
                  item.companyName.length > 23
                    ? `${item.companyName.slice(0, 23)}...`
                    : item.companyName,
              }
                ? item.companyName.length > 20
                  ? `${item.companyName.slice(0, 20)}...`
                  : item.companyName
                : item.companyName}
            </p>
          </div>

          {/* {showVertical && (
            <p className="text-tiny w-full text-right text-gray-600">
              {typeLabels[item.companyType] || "Unknown"}
            </p>
          )} */}
        </div>

        <div className="flex w-full justify-between items-center">
          <p
            className="text-sm text-gray-600 font-medium"
            title={`${item.city || "Unknown"}, ${item.state || "Unknown"}`}
          >
            <span className="block sm:hidden">
              {/* Mobile: show full text */}
              {`${item.city || "Unknown"}, ${item.state || "Unknown"}`}
            </span>
            <span className="hidden sm:block">
              {/* Desktop: apply truncation */}
              {(() => {
                const city = item.city || "Unknown";
                const state = item.state || "Unknown";
                const combined = `${city}, ${state}`;
                return combined.length > 12
                  ? combined.slice(0, 14) + "..."
                  : combined;
              })()}
            </span>
          </p>

          <div className="flex items-center gap-1 text-gray-600">
            <AiFillStar size={16} />
            <p className="text-sm  text-gray-600 font-medium">
              ({item.ratings || 0})
            </p>
          </div>
          {/* <p className="text-sm font-semibold">
            <span className="font-normal">Reviews</span> (
            {item.reviewCount || 0})
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
