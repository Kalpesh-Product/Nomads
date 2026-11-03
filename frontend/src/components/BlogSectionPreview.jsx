import { useId, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircleAlert, X } from "lucide-react";

const sampleContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const SampleArticleSection = ({ main = false, index = 0 }) => (
  <article className="flow-root text-slate-700">
    <h3 className={`mb-4 font-bold leading-snug ${main ? "text-2xl" : "text-xl"}`}>
      {main ? "Lorem ipsum dolor sit amet" : "Consectetur adipiscing elit"}
    </h3>
    <img
      src={main ? "/images/goa-image.jpg" : "/images/bali-image.jpg"}
      alt={main ? "Sample destination in Goa" : "Sample destination in Bali"}
      className={`mb-4 w-full rounded-xl sm:w-[38%] ${main || index % 2 !== 0 ? "sm:float-right sm:ml-6" : "sm:float-left sm:mr-6"}`}
    />
    <p className="whitespace-pre-line text-sm leading-relaxed">
      {sampleContent}{"\n\n"}{sampleContent}
    </p>
  </article>
);

const SampleDestination = ({ contentLabel }) => (
  <article className="text-slate-700">
    <h3 className="text-2xl font-bold leading-snug">Lorem ipsum dolor sit amet</h3>
    <img
      src="/images/goa-image.jpg"
      alt={`Sample ${contentLabel.toLowerCase()} image`}
      className="mt-6 aspect-[3.3/1] w-full rounded-xl object-cover"
    />
    <div className="mt-6 grid gap-4 text-sm font-bold sm:grid-cols-3">
      <p>Sample category</p>
      <p className="sm:text-center">{contentLabel === "Event" ? "Sample month" : "Sample rating"}</p>
      <p className="sm:text-right">{contentLabel === "Event" ? "Sample venue" : "Sample address"}</p>
    </div>
    <hr className="my-6 border-slate-200" />
    <p className="whitespace-pre-line text-sm leading-relaxed">{sampleContent}{"\n\n"}{sampleContent}</p>
  </article>
);

export default function BlogSectionPreview({ section = "overview", index = 0, contentLabel = "Blog", layout = "article" }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const title = section === "overview" ? `${contentLabel} Preview`
    : section === "main" ? "Main Content"
      : section === "sections" ? `${contentLabel} Sections` : `Section ${index + 1}`;

  return (
    <>
      <button
        type="button"
        aria-label={`Preview ${title}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 align-middle text-[10px] font-medium normal-case leading-none text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <CircleAlert aria-hidden="true" size={12} />
        Preview
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" } },
          paper: { sx: { borderRadius: "22px", maxHeight: "85vh", margin: 2, width: "calc(100% - 32px)" } },
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-blue-950">{title}</h2>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">Sample layout with placeholder text</p>
          </div>
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        <div className="overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            {layout === "destination" ? <SampleDestination contentLabel={contentLabel} /> : <>
            {(section === "overview" || section === "main") && <SampleArticleSection main />}
            {section === "overview" && <hr className="border-slate-200" />}
            {section !== "main" && <SampleArticleSection index={index} />}
            {(section === "overview" || section === "sections") && (
              <>
                <hr className="border-slate-200" />
                <SampleArticleSection index={1} />
              </>
            )}
            {section === "overview" && (
              <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
                <span>Author name</span><span>Publication date</span><span>Source (optional)</span>
              </footer>
            )}
            </>}
          </div>
          <p id={descriptionId} className="mt-3 text-center text-xs font-medium text-slate-400">
            Shown with sample images and text — your {contentLabel.toLowerCase()} uses the content you enter in this section.{layout === "article" ? " Section images are optional." : ""}
          </p>
        </div>
      </Dialog>
    </>
  );
}
