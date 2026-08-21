import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { ACCENT, FONT_IMPORT, LinedHeading, PAGE_BG, PAGE_WRAP, TEXT, focusStyle } from "./templates/freshStudio/FreshStudioShared";

const FreshStudioTemplateGalleryPage = () => {
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
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={data?.galleryPageHeading || "Gallery"} style={{ color: ACCENT }} />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {galleryItems.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openViewer(idx)}
              className="aspect-square overflow-hidden rounded-[4px] focus-visible:outline focus-visible:outline-2"
              style={{ backgroundColor: "#15151f", ...focusStyle }}
            >
              <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      </section>

      {viewerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6" onClick={() => setViewerOpen(false)}>
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
            className="max-h-[85vh] max-w-[85vw] rounded-[4px] object-contain"
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

export default FreshStudioTemplateGalleryPage;
