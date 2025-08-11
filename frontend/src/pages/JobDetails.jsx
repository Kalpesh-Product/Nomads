import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Container from "../components/Container";
import JobApplicationForm from "./JobApplicationForm";
import HostJobApplicationForm from "./host/HostJobApplicationForm";

const JobDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
 const {pathname} = useLocation();
 const isHost = pathname.includes("host")

  // Ideally this would come from context, API, or match from jobRoles
  const jobTitle = "UI Designer"; // Temporary placeholder

  return (
    <Container padding={false}>
      <div className="">
        <h2 className="text-4xl md:text-3xl font-normal text-center mb-6">
          {jobTitle}
        </h2>

        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-300 mb-8">
          <button
            className={`px-6 py-2 font-medium w-full ${
              activeTab === "description"
                ? "border-b-2 border-black"
                : "text-primary-blue"
            }`}
            onClick={() => setActiveTab("description")}>
            JOB DESCRIPTION
          </button>
          <button
            className={`px-6 py-2 font-medium w-full ${
              activeTab === "apply"
                ? "border-b-2 border-black "
                : "text-primary-blue"
            }`}
            onClick={() => setActiveTab("apply")}>
            APPLY NOW
          </button>
        </div>

        {/* Content */}
        {activeTab === "description" ? (
          <div className="text-sm leading-relaxed text-gray-800 space-y-6">
            {/* About the Job */}
            <div>
              <h3 className="text-lg font-semibold mb-2">About the Job</h3>
              <p>
                We are looking for a creative UI Designer to join our team. As a
                UI Designer, you will be responsible for crafting beautiful and
                intuitive interfaces for our products. You will work closely
                with our development and product teams to bring ideas to life.
                You should be passionate about user experience and design, with
                a keen eye for detail.
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                {[
                  "Design user interfaces for web and mobile applications.",
                  "Collaborate with product managers and developers to create intuitive, user-friendly software.",
                  "Develop wireframes, mockups, and prototypes to communicate design ideas.",
                  "Ensure consistency of design across various digital platforms.",
                  "Stay up to date with design trends and best practices.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="pb-8">
              <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
              <ul className="space-y-2">
                {[
                  "Bachelor’s degree in Graphic Design, UI/UX Design, or a related field.",
                  "Proven experience as a UI Designer or similar role.",
                  "Proficient in design software like Adobe XD, Sketch, or Figma.",
                  "Strong understanding of UX principles and user-centered design.",
                  "Excellent communication skills and attention to detail.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}

            <p className=" text-sm pb-8 mt-0 border-t border-gray-300 ">
              Please send in your Resume to <strong>Email : hr@wono.co</strong>{" "}
              if unable to apply now
            </p>
          </div>
        ) : (
          isHost ? <HostJobApplicationForm/> : <JobApplicationForm />
        )}
      </div>
    </Container>
  );
};

export default JobDetails;
