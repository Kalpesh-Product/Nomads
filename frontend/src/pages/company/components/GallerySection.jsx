import React, { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import TempModal from "../components/TempModal";
import { getMediaSrc } from "../utils/templateRouteUtils";

const GallerySection = ({
  gallery = [],
  mode = "full",
  previewCount = 6,
  onViewAll,
  showViewAllButton = mode === "preview",
}) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const visibleGallery = useMemo(() => {
    if (!Array.isArray(gallery)) return [];
    return mode === "preview" ? gallery.slice(0, previewCount) : gallery;
  }, [gallery, mode, previewCount]);

  const galleryItems = useMemo(
    () => (Array.isArray(gallery) ? gallery.map((item) => getMediaSrc(item)).filter(Boolean) : []),
    [gallery],
  );

  const selectedImage = galleryItems[selectedIndex] || galleryItems[0] || "";

  const openGalleryViewer = (index) => {
    if (!galleryItems.length) return;
    const nextIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
    setSelectedIndex(nextIndex);
    setOpen(true);
  };

  const closeGalleryViewer = () => setOpen(false);

  const goToGalleryIndex = (index) => {
    if (!galleryItems.length) return;
    const normalizedIndex = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    setSelectedIndex(normalizedIndex);
  };

  if (visibleGallery.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-[8px]">
        {visibleGallery.map((img, idx) => {
          const mediaSrc = getMediaSrc(img);
          return (
            <button
              key={img?._id || mediaSrc || `gallery-${idx}`}
              type="button"
              onClick={() => openGalleryViewer(idx)}
              className="overflow-hidden rounded-lg bg-slate-100 text-left"
            >
              <img
                src={mediaSrc}
                alt={`Gallery ${idx + 1}`}
                className="h-[190px] w-full object-cover transition duration-300 hover:scale-[1.02] md:h-[256px]"
              />
            </button>
          );
        })}
      </div>

      {showViewAllButton && typeof onViewAll === "function" ? (
        <div className="mt-6 flex justify-center md:mt-8">
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-full bg-[#6f6f6f] px-8 py-2 text-xs font-semibold text-white md:px-10 md:text-sm"
          >
            SHOW MORE
          </button>
        </div>
      ) : null}

      <TempModal
        bgColor="bg-white"
        padding="p-4"
        open={open}
        onClose={closeGalleryViewer}
        height="h-[100lvh] lg:h-[75vh]"
      >
        <div className="lg:pb-4 lg:pl-2">
          <div className="flex justify-end mb-2">
            <button
              onClick={closeGalleryViewer}
              className="text-2xl font-bold text-gray-700 transition-all hover:bg-gray-200 flex justify-end w-fit rounded-full"
            >
              <IoMdClose />
            </button>
          </div>

          <div className="relative grid grid-cols-1 gap-4 items-center h-full lg:h-[30rem] md:h-full lg:grid-cols-5">
            <div className="flex justify-center col-span-1 lg:col-span-4 items-center bg-black h-[30rem]">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-full object-contain md:object-cover"
              />
            </div>

            <div className="h-full lg:h-[30rem] overflow-y-auto col-span-1 bg-gray-100 p-2 custom-scrollbar-hide">
              <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-1 gap-2">
                {galleryItems.map((item, idx) => (
                  <img
                    key={item || `thumb-${idx}`}
                    src={item}
                    alt="thumb"
                    className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                      idx === selectedIndex ? "border-blue-500" : "border-transparent"
                    }`}
                    onClick={() => goToGalleryIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </TempModal>
    </div>
  );
};

export default GallerySection;
