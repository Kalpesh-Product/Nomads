import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { BROWN, FONT_IMPORT, LinedHeading, PAGE_WRAP, SANS } from "./templates/warmOrganic/WarmOrganicShared";

const WarmOrganicTemplateGalleryPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading gallery page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const galleryItems = t.galleryItems;

  const openViewer = (index) => {
    if (!galleryItems.length) return;
    setViewerIndex(Math.max(0, Math.min(index, galleryItems.length - 1)));
    setViewerOpen(true);
  };
  const goToIndex = (index) => {
    if (!galleryItems.length) return;
    setViewerIndex(((index % galleryItems.length) + galleryItems.length) % galleryItems.length);
  };

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={data?.galleryTitle || "Gallery"} className="justify-center" />
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
          {galleryItems.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openViewer(idx)}
              className="aspect-square overflow-hidden rounded-2xl"
              style={{ backgroundColor: `${BROWN}0D` }}
            >
              <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      </section>

      {viewerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6" onClick={() => setViewerOpen(false)}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(viewerIndex - 1);
            }}
            className="absolute left-6 text-2xl text-white/70 hover:text-white"
          >
            ←
          </button>
          <img
            src={galleryItems[viewerIndex]}
            alt=""
            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(viewerIndex + 1);
            }}
            className="absolute right-6 text-2xl text-white/70 hover:text-white"
          >
            →
          </button>
          <button type="button" onClick={() => setViewerOpen(false)} className="absolute right-6 top-6 text-sm text-white/70 hover:text-white">
            Close ✕
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default WarmOrganicTemplateGalleryPage;
