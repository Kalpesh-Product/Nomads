import React, { useState } from "react";
import TempModal from "../components/TempModal"; // adjust import path
import TempButton from "./TempButton";
import { IoMdClose } from "react-icons/io";

const GallerySection = ({ gallery = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(gallery[0]?.url || "");

  const handleOpen = (imgUrl) => {
    setSelectedImage(imgUrl || gallery[0]?.url);
    setOpen(true);
  };

  return (
    <div className="w-full">
      {/* Gallery preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.slice(0, 6).map((img) => (
          <div key={img._id} className="h-64 w-full overflow-hidden">
            <img
              src={img.url}
              alt="gallery"
              className="rounded-lg cursor-pointer object-cover w-full h-full "
              onClick={() => handleOpen(img.url)}
            />
          </div>
        ))}
      </div>

      {/* Show More button */}
      {gallery.length > 6 && (
        <div className="flex justify-center mt-6">
          <TempButton handleClick={() => handleOpen()} buttonText="Show More" />
        </div>
      )}

      {/* Modal */}
      <TempModal
        bgColor="bg-white"
        padding="p-4"
        open={open}
        onClose={() => setOpen(false)}
        height="h-[100lvh] lg:h-[75vh]"
      >
        <div>
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setOpen(false)}
              className=" text-gray-700 transition-all text-2xl hover:bg-gray-200 font-bold z-10 flex justify-end w-fit rounded-full"
            >
              <IoMdClose />
            </button>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-4 items-center h-full lg:h-[30rem] md:h-full">
            {/* Close Button */}

            {/* Main Image */}
            <div className="flex justify-center col-span-1 lg:col-span-4 items-center bg-black h-[30rem]">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-full object-contain md:object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="h-full lg:h-[30rem] overflow-y-auto col-span-1 bg-gray-100 p-2 custom-scrollbar-hide">
              <div className="grid grid-cols-5  md:grid-cols-4 lg:grid-cols-1 gap-2">
                {gallery.map((img) => (
                  <img
                    key={img._id}
                    src={img.url}
                    alt="thumb"
                    className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                      img.url === selectedImage
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(img.url)}
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
