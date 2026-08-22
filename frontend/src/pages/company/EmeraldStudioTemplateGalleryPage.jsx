import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  LinedHeading,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";

const EmeraldStudioTemplateGalleryPage = () => {
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
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-16 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto text-center">
          <LinedHeading title={data?.galleryTitle || "Gallery"} className="justify-center" />
        </div>
      </section>
      <section className={`px-6 pb-24 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((src, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#004f3b] cursor-pointer"
              onClick={() => openViewer(idx)}
            >
              <img
                src={src}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {viewerOpen ? (
        <div className="fixed inset-0 z-50 bg-emerald-950/95 flex items-center justify-center px-6" onClick={() => setViewerOpen(false)}>
          <button className="absolute top-6 right-6 text-stone-400 hover:text-stone-100 transition-colors" onClick={() => setViewerOpen(false)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={galleryItems[viewerIndex]} alt="" className="w-full rounded-2xl" />
          </div>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(viewerIndex - 1);
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(viewerIndex + 1);
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default EmeraldStudioTemplateGalleryPage;
