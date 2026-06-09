import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FiChevronDown, FiX } from "react-icons/fi";
import TempModal from "./TempModal";
import { api } from "../../../utils/axios";

const STAR_OPTIONS = [5, 4, 3, 2, 1];

const ReviewFormModal = ({
  open,
  onClose,
  companyId = "",
  companyName = "",
}) => {
  const [name, setName] = useState("");
  const [starCount, setStarCount] = useState(5);
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const isFormReady = useMemo(() => Boolean(companyId), [companyId]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setStarCount(5);
    setDescription("");
    setSubmitError("");
    setSubmitMessage("");
  }, [open]);

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        companyId,
        businessId: companyId,
        companyName,
        name: name.trim() || "Anonymous",
        starCount: Number(starCount),
        description: description.trim(),
        reviewSource: "Nomads Website",
        reviewLink:
          typeof window !== "undefined" ? window.location.href : "",
      };

      const response = await api.post("/review", payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSubmitError("");
      setSubmitMessage(
        response?.message || "Review submitted successfully for approval.",
      );
      setName("");
      setStarCount(5);
      setDescription("");
      setTimeout(() => {
        onClose?.();
      }, 900);
    },
    onError: (error) => {
      setSubmitMessage("");
      setSubmitError(
        error?.response?.data?.message ||
          "Unable to submit review. Please try again.",
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitMessage("");

    if (!isFormReady) {
      setSubmitError("Company information is not available.");
      return;
    }

    if (!name.trim()) {
      setSubmitError("Full name is required.");
      return;
    }

    if (!description.trim()) {
      setSubmitError("Review details are required.");
      return;
    }

    submitReview();
  };

  return (
    <TempModal open={open} onClose={onClose} bgColor="bg-transparent" width="w-full max-w-[560px]">
      <div className="rounded-[28px] bg-white px-5 py-5 shadow-2xl sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[26px] font-semibold text-[#1f2937]">
              Write a Review
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your review will appear in the Website Builder reviews page for approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#5b6472] transition hover:bg-slate-100 hover:text-black"
            aria-label="Close review form"
          >
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full Name"
            className="h-12 w-full rounded-none border border-slate-300 px-4 text-[15px] outline-none transition focus:border-slate-500"
          />

          <div className="relative overflow-hidden rounded-[8px] border border-slate-300 bg-white">
            <select
              value={starCount}
              onChange={(event) => setStarCount(Number(event.target.value))}
              className="h-12 w-full appearance-none border-0 bg-transparent px-4 pr-10 text-[15px] outline-none transition focus:outline-none"
            >
              {STAR_OPTIONS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Stars
                </option>
              ))}
            </select>
            <FiChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write your review"
            rows={5}
            className="min-h-[124px] w-full resize-none rounded-[8px] border border-slate-300 px-4 py-3 text-[15px] outline-none transition focus:border-slate-500"
          />

          {submitError ? (
            <p className="text-sm font-medium text-red-600">{submitError}</p>
          ) : null}

          {submitMessage ? (
            <p className="text-sm font-medium text-emerald-600">{submitMessage}</p>
          ) : null}

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="min-w-[180px] rounded-full bg-[#7a7a7a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#656565] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </TempModal>
  );
};

export default ReviewFormModal;
