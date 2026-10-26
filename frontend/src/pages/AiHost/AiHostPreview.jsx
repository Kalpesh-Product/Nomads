import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { demoSiteUrl } from "../../constants/verticalTemplateCatalog";

// Full-screen so it feels like actually visiting the site, not a page nested
// inside our own nav — deliberately NOT mounted under AiHostLayout (see
// routes.jsx). The iframe keeps the browser's address bar on our own domain
// at /preview/:templateId instead of jumping to masterpanel.wono.co, which is
// where this sample-content preview is actually generated and served from.
const AiHostPreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

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
      <iframe
        key={templateId}
        src={demoSiteUrl(templateId)}
        title={`${templateId} theme preview`}
        className="min-h-0 flex-1 border-0"
      />
    </div>
  );
};

export default AiHostPreview;
