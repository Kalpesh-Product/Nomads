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

// host.wono.co (above) is only the marketing/signup front door — it has no
// real login of its own. An already-registered host renewing their
// verification needs the actual app, hostpanel.wono.co (same one
// AiHostHeader/AiHostSidebar's "Login"/"Dashboard" links send existing hosts
// to), which in local dev is the separate HostPanel client dev server, not
// this Nomads dev server's own "host" tenant.
const HOSTPANEL_APP_URL = String(
  import.meta.env.DEV
    ? import.meta.env.VITE_HOSTPANEL_APP_URL_DEV || "http://localhost:3006"
    : import.meta.env.VITE_HOSTPANEL_APP_URL || "https://hostpanel.wono.co",
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
//
// A business that was verified before but has since lapsed (verified badge
// off, but a past verificationExpiresAt exists) gets a different nudge: it
// sends an already-registered host straight to login instead of signup, with
// ?renewCompanyId= so HostPanel can offer to jump straight to Renew once
// that owner/super_admin logs in for that exact company (see
// resolvePostLoginRoute in HostPanel). A business that's still actively
// verified but has the badge manually hidden (verificationExpiresAt in the
// future) is not "expired" and falls through to the ordinary signup nudge.
const VerifyBusinessButton = ({
  companyId,
  businessId,
  isVerified,
  verificationExpiresAt,
}) => {
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

  const hasExpiredVerification =
    Boolean(verificationExpiresAt) &&
    new Date(verificationExpiresAt).getTime() <= Date.now();

  const handleClick = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    // HostPanel's login page is mounted at "/", not "/login".
    let target = hasExpiredVerification
      ? `${HOSTPANEL_APP_URL}/?renewCompanyId=${encodeURIComponent(companyId)}`
      : `${HOST_PANEL_URL}/signup`;
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
        target = `${target}${target.includes("?") ? "&" : "?"}vc=${encodeURIComponent(data.clickId)}`;
      }
    } catch {
      // Tracking is best-effort: still send them on.
    }
    window.location.href = target;
  };

  return (
    <Tooltip
      title={
        hasExpiredVerification
          ? "Verification expired — click to renew"
          : "Register to become a host to get verified badge"
      }
    >
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
