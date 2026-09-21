import React from "react";
import { Tooltip } from "@mui/material";
import { MdVerified } from "react-icons/md";

const HOST_PANEL_URL = String(
  import.meta.env.VITE_HOST_PANEL_URL || "https://host.wono.co",
).replace(/\/+$/, "");

// Verification is now entirely host-managed (submitted, paid, renewed from
// HostPanel's own "Verify Business" module) — this component only ever
// shows the resulting badge, or a nudge to go become a host in the first
// place. It no longer opens anything on the Nomads site itself.
const VerifyBusinessButton = ({ companyId, isVerified }) => {
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

  return (
    <Tooltip title="Register to become a host to get verified badge">
      <button
        type="button"
        onClick={() => {
          window.location.href = `${HOST_PANEL_URL}/signup`;
        }}
        className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-blue border border-primary-blue rounded-full px-3 py-1 hover:bg-primary-blue hover:text-white transition-colors align-middle"
      >
        <MdVerified className="text-sm" />
        Unverified
      </button>
    </Tooltip>
  );
};

export default VerifyBusinessButton;
