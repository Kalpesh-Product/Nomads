import React from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { MdVerified } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const VerifyBusinessButton = ({
  companyId,
  companyName,
  isVerified,
  country,
  state,
  city,
  continent,
  website,
  registeredEntityName,
}) => {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // Only fetched to decide whether *this* logged-in viewer is the one who
  // submitted verification for *this* company — so a small "Manage" link can
  // sit next to the badge for them, without showing it to every visitor.
  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-verification-requests"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/verification/my-requests");
      return response.data?.data || [];
    },
    enabled: Boolean(isVerified && userId && companyId),
    staleTime: 5 * 60 * 1000,
  });

  if (!companyId) return null;

  if (isVerified) {
    const canManage = myRequests.some(
      (request) =>
        request.companyId === companyId && request.paymentStatus === "paid",
    );

    // Sits right after the name, on the left side of the row — unlike the
    // unverified "Verify Business" button which is pushed to the right (see
    // the parent h1's conditional justify-between).
    return (
      <span className="inline-flex items-center gap-2 ml-2 align-middle">
        <Tooltip title="Verified Business">
          <span className="inline-flex items-center">
            <MdVerified className="text-[#1d9bf0] text-2x2" />
          </span>
        </Tooltip>
        {canManage && (
          <button
            type="button"
            onClick={() => navigate("/profile?tab=verification")}
            className="text-xs font-medium text-primary-blue underline"
          >
            Manage Verification
          </button>
        )}
      </span>
    );
  }

  const buildTargetUrl = () => {
    const params = new URLSearchParams();
    params.set("companyId", companyId);
    if (companyName) params.set("companyName", companyName);
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    if (continent) params.set("continent", continent);
    if (website) params.set("website", website);
    if (registeredEntityName)
      params.set("registeredEntityName", registeredEntityName);
    return `/verify-business?${params.toString()}`;
  };

  const handleClick = () => {
    const target = buildTargetUrl();
    if (!userId) {
      navigate("/login", { state: { redirectTo: target } });
      return;
    }
    navigate(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-blue border border-primary-blue rounded-full px-3 py-1 hover:bg-primary-blue hover:text-white transition-colors align-middle"
    >
      <MdVerified className="text-sm" />
      Verify Business
    </button>
  );
};

export default VerifyBusinessButton;
