import { AiFillHeart, AiTwotoneHeart } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useContentFavorites from "../hooks/useContentFavorites";

export default function ContentFavoriteButton({ item, kind, showRemoveFavoriteIcon = false }) {
  const navigate = useNavigate();
  const { favorites, userId, mutation, isPending, isError } = useContentFavorites();
  const updating = useIsMutating({ mutationKey: ["contentFavorites", userId] }) > 0;
  const isFavorited = favorites.some((favorite) =>
    favorite.kind === kind && favorite.item._id === item._id,
  );
  return (
    <button
      type="button"
      className="absolute right-2 top-2 z-10 cursor-pointer disabled:cursor-wait"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
      disabled={updating || (!!userId && (isPending || isError))}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!userId) return navigate("/login");
        if (showRemoveFavoriteIcon && isFavorited) {
          const result = await Swal.fire({
            title: "Remove from favorites?",
            text: "Are you sure you want to delete this favorite?",
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Yes, delete it", cancelButtonText: "Cancel",
            confirmButtonColor: "#111827",
          });
          if (!result.isConfirmed) return;
        }
        mutation.mutate({ kind, item, isFavorited: !isFavorited });
      }}
    >
      {showRemoveFavoriteIcon ? (
        <IoClose className="rounded-full bg-white p-1 text-black" size={28} />
      ) : isFavorited ? (
        <AiFillHeart className="text-[#ff5757]" size={22} />
      ) : <AiTwotoneHeart className="text-white" size={22} />}
    </button>
  );
}
