import { createElement, useState } from "react";
import { FiShare2 } from "react-icons/fi";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaWhatsapp } from "react-icons/fa";
import DetailIconButton from "./DetailIconButton";
import TransparentModal from "./TransparentModal";

export default function ContentShareButton({ title, url, kind }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const shareTitle = `View ${title} on Nomads by WONO`;
  const platforms = [
    { label: "WhatsApp", icon: FaWhatsapp, color: "text-[#25D366]", href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${url}`)}` },
    { label: "Facebook", icon: FaFacebookF, color: "text-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", icon: FaTwitter, color: "text-black", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(url)}` },
    { label: "LinkedIn", icon: FaLinkedinIn, color: "text-[#0A66C2]", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setError("");
    } catch {
      setError("Select the link above to copy it manually.");
    }
  };

  return (
    <>
      <DetailIconButton aria-label={`Share this ${kind}`} onClick={() => { setCopied(false); setError(""); setOpen(true); }}>
        <FiShare2 size={22} aria-hidden="true" />
      </DetailIconButton>
      <TransparentModal open={open} onClose={() => setOpen(false)} title={`Share this ${kind}`} bgColor="bg-white" width="w-full max-w-md" height="h-auto max-h-[90vh]">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Choose a platform to share the link.</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{kind} URL</p>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
              <input aria-label="Share URL" readOnly value={url} onFocus={(event) => event.target.select()} className="w-full min-w-0 bg-transparent text-xs text-gray-700 outline-none" />
              <button type="button" onClick={copyLink} className="rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white transition hover:bg-blue-600">{copied ? "Copied" : "Copy"}</button>
            </div>
            <p role="status" className="mt-1 text-xs text-gray-600">{error || (copied ? "Link copied." : "")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {platforms.map(({ label, icon: Icon, color, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 px-3 py-3 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">{createElement(Icon, { className: color, size: 18 })}</span>
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </TransparentModal>
    </>
  );
}
