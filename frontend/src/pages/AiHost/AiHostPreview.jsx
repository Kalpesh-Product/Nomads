import { useState } from "react";
import { useParams } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { demoSiteUrl } from "../../constants/verticalTemplateCatalog";

// Full-screen so it feels like actually visiting the site, not a page nested
// inside our own nav — deliberately NOT mounted under AiHostLayout (see
// routes.jsx). The iframe keeps the browser's address bar on our own domain
// at /preview/:templateId instead of jumping to masterpanel.wono.co, which is
// where this sample-content preview is actually generated and served from.
const AiHostPreview = () => {
  const { templateId } = useParams();
  // The iframe's own page (master panel bundle + the chosen template's lazy
  // chunk) takes a moment to load — without this it's just blank white in
  // the meantime, which reads as broken rather than loading.
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* <div className="flex min-h-[48px] shrink-0 items-center gap-3 border-b border-black/10 bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500 transition-colors hover:bg-sky-50"
          aria-label="Close preview"
        >
          <HiOutlineArrowLeft size={16} />
        </button>
        <span className="text-sm font-medium text-black/55">Previewing with sample content</span>
      </div> */}
      <div className="relative min-h-0 flex-1">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-sky-500" />
            <p className="text-sm font-medium text-black/55">Loading preview…</p>
          </div>
        ) : null}
        <iframe
          key={templateId}
          src={demoSiteUrl(templateId)}
          title={`${templateId} theme preview`}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
};

export default AiHostPreview;
