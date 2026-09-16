import React, { useEffect, useState } from "react";
import { Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { showErrorAlert } from "../utils/alerts";
import {
  CHANGE_TYPE_LABELS,
  TIER_LABELS,
  TIER_OPTIONS,
  computeProjectedPeriod,
} from "../constants/verificationTiers";

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const STATUS_LABELS = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const COMPANY_TYPE_LABELS = {
  coworking: "Co-Working",
  coliving: "Co-Living",
  workation: "Workation",
  meetingroom: "Meetings",
  privatestay: "Private Stay",
  hostel: "Hostel",
  cafe: "Cafe",
};

const getPaymentStatusLabel = (request) => {
  if (!request.paymentStatus || request.paymentStatus === "not_required") {
    return "--";
  }
  if (request.paymentStatus === "awaiting_payment") {
    return "Payment link sent — check your email";
  }
  const expired =
    request.verificationExpiresAt &&
    new Date(request.verificationExpiresAt) <= new Date();
  return expired ? "Expired" : "Active";
};

const PlanHistory = ({ requestId }) => {
  const axiosPrivate = useAxiosPrivate();

  const { data: history = [], isPending } = useQuery({
    queryKey: ["verification-plan-history", requestId],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/verification/${requestId}/history`);
      return response.data?.data || [];
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <CircularProgress size={18} />
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-sm font-semibold mb-3">Recent Plan Changes & Renewals</p>
      <div className="space-y-2">
        {history
          .filter((entry) => entry.status === "paid")
          .map((entry) => (
            <div
              key={entry._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm bg-gray-50 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {CHANGE_TYPE_LABELS[entry.changeType] || entry.changeType}
                </span>
                <span className="text-gray-500">
                  {TIER_LABELS[entry.tier] || entry.tier} · ${entry.amount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-600 text-xs sm:text-sm">
                  {formatDate(entry.paidAt)}
                  {entry.verificationExpiresAt
                    ? ` → valid until ${formatDate(entry.verificationExpiresAt)}`
                    : ""}
                </div>
                {(entry.hostedInvoiceUrl || entry.invoicePdfUrl) && (
                  <a
                    href={entry.hostedInvoiceUrl || entry.invoicePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-medium text-primary-blue underline whitespace-nowrap"
                  >
                    Invoice
                  </a>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const RequestCard = ({ request, defaultAction }) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState(
    request.activeTier || request.requestedTier || "1m",
  );
  const [showTierPicker, setShowTierPicker] = useState(
    defaultAction === "change",
  );

  const canManage = request.paymentStatus === "paid";
  const expired =
    request.verificationExpiresAt &&
    new Date(request.verificationExpiresAt) <= new Date();

  const projectedPeriod = computeProjectedPeriod(
    request.verificationExpiresAt,
    selectedTier,
  );
  const projectedStartsLater =
    new Date(projectedPeriod.start) > new Date() && !expired;

  const hasVerticals = canManage && request.verticalsSnapshot?.length > 0;

  // Live lookup instead of trusting the snapshot taken at submission time —
  // a listing can be deactivated/deleted afterwards, or its slug can change,
  // so the link (and whether it's clickable at all) has to reflect the
  // listing's current state, not what it was when this request was filed.
  const { data: liveListings = [], isFetching: isLoadingLiveListings } = useQuery({
    queryKey: ["verification-live-listings", request.companyId],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/company/get-listings/${request.companyId}`,
      );
      return response.data || [];
    },
    enabled: hasVerticals,
  });

  const { mutate: requestPaymentLink, isPending } = useMutation({
    mutationFn: async (tier) => {
      const response = await axiosPrivate.post(
        `/verification/${request._id}/request-payment-link`,
        { tier },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-verification-requests"] });
      if (data?.paymentLinkUrl) {
        window.location.href = data.paymentLinkUrl;
      }
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message || "Failed to start payment",
      );
    },
  });

  return (
    <div className="border rounded-lg p-4 sm:p-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base sm:text-lg break-words">
            {request.businessName || request.companyName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Review Status:{" "}
            <span className="font-medium">
              {STATUS_LABELS[request.status] || request.status}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Payment Status:{" "}
            <span className="font-medium">{getPaymentStatusLabel(request)}</span>
          </p>
        </div>
        {canManage && (
          <div className="text-sm sm:text-right text-gray-600 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0">
            <p>
              <span className="font-medium">Current Plan:</span>{" "}
              {TIER_LABELS[request.activeTier] || request.activeTier}
            </p>
            <p>
              <span className="font-medium">Started:</span>{" "}
              {formatDate(request.paidAt)}
            </p>
            <p>
              <span className="font-medium">
                {expired ? "Expired:" : "Active Until:"}
              </span>{" "}
              {formatDate(request.verificationExpiresAt)}
            </p>
          </div>
        )}
      </div>

      {canManage && (
        <div className="mt-4 pt-4 border-t">
          {!showTierPicker ? (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                variant="contained"
                size="small"
                fullWidth={false}
                disabled={isPending}
                sx={{
                  bgcolor: "#0BA9EF",
                  textTransform: "none",
                  borderRadius: 20,
                  "&:hover": { bgcolor: "#0BA9EF" },
                }}
                onClick={() => requestPaymentLink(request.activeTier)}
              >
                {isPending && defaultAction !== "change" ? (
                  <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
                ) : null}
                Renew Now
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: "none", borderRadius: 20 }}
                onClick={() => setShowTierPicker(true)}
              >
                Change Plan
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <TextField
                  select
                  size="small"
                  variant="standard"
                  label="Plan"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  sx={{ minWidth: { xs: "100%", sm: 140 } }}
                >
                  {TIER_OPTIONS.map((tier) => (
                    <MenuItem key={tier.value} value={tier.value}>
                      {tier.label} — ${tier.price}
                    </MenuItem>
                  ))}
                </TextField>
                <div className="flex gap-3">
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isPending}
                    sx={{
                      bgcolor: "#0BA9EF",
                      textTransform: "none",
                      borderRadius: 20,
                      "&:hover": { bgcolor: "#0BA9EF" },
                    }}
                    onClick={() => requestPaymentLink(selectedTier)}
                  >
                    {isPending ? (
                      <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
                    ) : null}
                    Pay & Apply
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={() => setShowTierPicker(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="text-xs sm:text-sm bg-blue-50 text-blue-900 rounded-lg px-3 py-2">
                {projectedStartsLater ? (
                  <>
                    Your current plan is still active, so nothing is wasted —
                    the new plan starts on{" "}
                    <b>{formatDate(projectedPeriod.start)}</b> (right after
                    your current one ends) and runs until{" "}
                    <b>{formatDate(projectedPeriod.end)}</b>.
                  </>
                ) : (
                  <>
                    This plan starts today,{" "}
                    <b>{formatDate(projectedPeriod.start)}</b>, and runs until{" "}
                    <b>{formatDate(projectedPeriod.end)}</b>.
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {hasVerticals && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold mb-3">
            Verified Listings ({request.verticalsSnapshot.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {isLoadingLiveListings ? (
              <CircularProgress size={16} />
            ) : (
            request.verticalsSnapshot.map((vertical, index) => {
              const live = liveListings.find(
                (listing) => listing.businessId === vertical.businessId,
              );
              const label = `${
                COMPANY_TYPE_LABELS[vertical.companyType] ||
                vertical.companyType
              }${vertical.city ? ` · ${vertical.city}` : ""}`;

              // isPublic is the same rule the listing pages themselves use
              // for "visible to any nomad" — isActive alone isn't enough.
              if (!live?.isPublic) {
                return (
                  <span
                    key={vertical.businessId || index}
                    title="This listing isn't live right now"
                    className="text-sm bg-gray-100 text-gray-400 rounded-lg px-3 py-1.5 cursor-not-allowed"
                  >
                    {label} · Inactive
                  </span>
                );
              }

              const slug =
                live.companyTitle ||
                live.companyName ||
                request.businessName ||
                request.companyName ||
                "";

              return (
                <a
                  key={vertical.businessId || index}
                  href={`/listings/${encodeURIComponent(slug)}?businessId=${encodeURIComponent(live.businessId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-blue-50 text-primary-blue rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
                >
                  {label}
                </a>
              );
            })
            )}
          </div>
        </div>
      )}

      <PlanHistory requestId={request._id} />
    </div>
  );
};

const MyVerification = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusRequestId = searchParams.get("requestId");
  const defaultAction = searchParams.get("action");

  useEffect(() => {
    if (!auth?.user) navigate("/login", { replace: true });
  }, [auth, navigate]);

  const { data: requests = [], isPending } = useQuery({
    queryKey: ["my-verification-requests"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/verification/my-requests");
      return response.data?.data || [];
    },
    enabled: !!auth?.user,
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <CircularProgress size={28} />
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 sm:px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
      <h2 className="text-hero min-h-[3rem] text-center font-play text-black mb-6">
        My Verification
      </h2>

      {requests.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="mb-4">
            You haven't submitted a business verification request yet.
          </p>
          <Button
            variant="contained"
            sx={{
              bgcolor: "black",
              borderRadius: 20,
              px: 6,
              py: 1,
              textTransform: "none",
              "&:hover": { bgcolor: "#333" },
            }}
            onClick={() => navigate("/verify-business")}
          >
            Verify Your Business
          </Button>
        </div>
      ) : (
        requests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            defaultAction={
              focusRequestId === request._id ? defaultAction : undefined
            }
          />
        ))
      )}
    </div>
  );
};

export default MyVerification;
