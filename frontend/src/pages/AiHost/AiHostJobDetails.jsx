import React, { useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineArrowLeft } from "react-icons/hi";
import Container from "../../components/Container";
import HostJobApplicationForm from "../host/HostJobApplicationForm";
import axios from "../../utils/axios";

const slugifyTitle = (value = "") =>
  value
    .toLowerCase()
    .replace(/[.\s/]+/g, "-")
    .replace(/-\)/g, ")")
    .replace(/\(-/g, "(");

const AiHostJobDetails = () => {
  const navigate = useNavigate();
  const { title } = useParams();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState("description");

  const initialJob = useMemo(() => {
    if (!state?.jobName) {
      return null;
    }

    return {
      about: state.about,
      responsibilities: state.responsibilities,
      qualifications: state.qualifications,
      title: state.jobName,
    };
  }, [state]);

  const {
    data: jobData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ai-host-job-details", title],
    enabled: !initialJob && Boolean(title),
    queryFn: async () => {
      const response = await axios.get(`/job/get-job-posts?ts=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const allJobs = response?.data?.flatMap((category) => category.jobPosts || []) || [];
      return (
        allJobs.find((job) => slugifyTitle(job.title) === title) || null
      );
    },
    staleTime: 0,
  });

  const resolvedJob = initialJob || jobData;

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate("/host/ai-host-career")}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500"
          aria-label="Go back to AI host career"
        >
          <HiOutlineArrowLeft size={18} />
        </button>
      </div>

      <Container>
        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <CircularProgress />
          </div>
        ) : !resolvedJob || isError ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-semibold text-host">Job not found</h2>
            <p className="text-secondary-dark">
              This job could not be loaded. Please go back and try again.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-center text-xl font-normal lg:text-3xl">
              {resolvedJob.title?.split("-")?.length
                ? resolvedJob.title?.split("-")?.join(" ")?.toUpperCase()
                : resolvedJob.title}
            </h2>

            <div className="mb-8 flex justify-center border-b border-gray-300">
              <button
                className={`w-full font-medium ${
                  activeTab === "description"
                    ? "border-b-2 border-black"
                    : "text-primary-blue"
                }`}
                onClick={() => setActiveTab("description")}
              >
                JOB DESCRIPTION
              </button>
              <button
                className={`w-full px-6 py-2 font-medium ${
                  activeTab === "apply"
                    ? "border-b-2 border-black"
                    : "text-primary-blue"
                }`}
                onClick={() => setActiveTab("apply")}
              >
                APPLY NOW
              </button>
            </div>

            {activeTab === "description" ? (
              <div className="space-y-6 pb-8 text-sm leading-relaxed text-gray-800">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">About the Job</h3>
                  <p>{resolvedJob.about}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Responsibilities</h3>
                  <ul className="space-y-2">
                    {(resolvedJob.responsibilities || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pb-8">
                  <h3 className="mb-2 text-lg font-semibold">Qualifications</h3>
                  <ul className="space-y-2">
                    {(resolvedJob.qualifications || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-0 border-t border-gray-300 pb-8 pt-4 text-sm">
                  Please send in your Resume to{" "}
                  <strong>
                    Email :{" "}
                    <a className="text-primary-blue" href="mailto:hr@wono.co">
                      hr@wono.co
                    </a>
                  </strong>{" "}
                  if unable to apply now
                </p>
              </div>
            ) : (
              <HostJobApplicationForm title={title} />
            )}
          </div>
        )}
      </Container>
    </>
  );
};

export default AiHostJobDetails;
