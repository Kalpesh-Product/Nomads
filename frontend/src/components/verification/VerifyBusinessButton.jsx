import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import { MdVerified } from "react-icons/md";
import { api } from "../../utils/axios";

// While developing locally the host site is the "host" tenant on
// host.localhost (see getTenantFromHost in routes.jsx), on the same port as
// this dev server — not the live host.wono.co that VITE_HOST_PANEL_URL points
// to for builds. VITE_HOST_PANEL_URL_DEV overrides the local address.
const HOST_PANEL_URL = String(
  import.meta.env.DEV
    ? import.meta.env.VITE_HOST_PANEL_URL_DEV ||
        `${window.location.protocol}//host.localhost:${window.location.port || 5173}`
    : import.meta.env.VITE_HOST_PANEL_URL || "https://host.wono.co",
).replace(/\/+$/, "");

const VISITOR_ID_KEY = "wono_visitor_id";
// Never hold the visitor up for long if the tracking call is slow.
const TRACK_TIMEOUT_MS = 2500;

// Anonymous, per-browser id so repeat clicks can be recognised.
const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
};

// Verification is entirely host-managed (submitted, paid, renewed from
// HostPanel's own "Verify Business" module) — this component shows the
// resulting badge, or a nudge to become a host. The nudge records which
// listing's company the visitor wants to verify and carries that to the host
// signup (?vc=<clickId>), which pre-fills the company from it.
const VerifyBusinessButton = ({ companyId, businessId, isVerified }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!companyId) return null;

  if (isVerified) {
    return (
      <Tooltip title="Verified Business">
        <span className="inline-flex items-center ml-2 align-middle">
          <MdVerified className="text-[#1d9bf0] text-2xl" />
        </span>
      </Tooltip>
    );
  }

  const handleClick = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    let target = `${HOST_PANEL_URL}/signup`;
    try {
      const { data } = await api.post(
        "/company/verify-business-click",
        {
          companyId,
          businessId,
          visitorId: getVisitorId(),
          listingUrl: window.location.href,
          referrer: document.referrer || "",
        },
        { timeout: TRACK_TIMEOUT_MS },
      );
      if (data?.clickId) {
        target = `${target}?vc=${encodeURIComponent(data.clickId)}`;
      }
    } catch {
      // Tracking is best-effort: still send them on to sign up.
    }
    window.location.href = target;
  };

  return (
    <Tooltip title="Register to become a host to get verified badge">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRedirecting}
        className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-blue border border-primary-blue rounded-full px-3 py-1 hover:bg-primary-blue hover:text-white transition-colors align-middle disabled:opacity-60"
      >
        <MdVerified className="text-sm" />
        {isRedirecting ? "Redirecting..." : "Verify Business"}
      </button>
    </Tooltip>
  );
};

export default VerifyBusinessButton;
