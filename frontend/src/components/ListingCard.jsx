import { useState } from "react";
import { AiFillHeart, AiFillStar, AiOutlineHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const ListingCard = ({ item, handleNavigation }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const thumbnailImage = (item?.images?.[0]?.url) ;

  console.log("item in listings ", thumbnailImage);

  return (
    <div
      onClick={handleNavigation}
      // className="flex flex-col gap-2 h-56 w-[95%] bg-white  rounded-lg  transition-all cursor-pointer">
      className="flex flex-col gap-2 w-full max-w-sm bg-white rounded-lg transition-all cursor-pointer"
    >
      {/* <div className="h-full w-full overflow-hidden rounded-3xl border-2 relative"> */}
      <div className="w-full aspect-square overflow-hidden rounded-3xl border-2 relative">
        <img
          src={
            thumbnailImage ||
            "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp"
          }
          alt={item.companyName}
          className="w-full h-full object-cover hover:scale-105 transition-all"
        />
        <div
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => toggleFavorite(item._id)}
        >
          {favorites.includes(item._id) ? (
            <AiFillHeart className="text-white" size={22} />
          ) : (
            <AiOutlineHeart className="text-white" size={22} />
          )}
        </div>
      </div>

      <div className="h-[25%] flex flex-col gap-1 px-4">
        <div className="flex w-full justify-between items-center">
          <p className="text-sm font-semibold">{item.companyName}</p>
        </div>

        <div className="flex w-full gap-2 items-center">
          <p className="text-sm text-gray-600 font-medium">
            {item.city || "Unknown"}, {item.state || "Unknown"}
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
