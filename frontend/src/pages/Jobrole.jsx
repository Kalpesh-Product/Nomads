import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Jobrole = () => {
  const jobRoles = [
    {
      title: "I. Product Management",
      jobs: [
        {
          id: 1,
          title: "UI Designer",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
        {
          id: 2,
          title: "Marketing Analytics",
          subtitle: "(SEO/Google Analytics)",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
    {
      title: "II. Tech Development",
      jobs: [
        {
          id: 3,
          title: "Jr. UI/UX Developer",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
        {
          id: 4,
          title: "PHP Developer",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
        {
          id: 5,
          title: "Web Developer Intern",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="flex flex-col gap-4">
      {jobRoles.map((section, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div key={idx} className="border-b pb-4 overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => toggleAccordion(idx)}
              className="w-full flex justify-between items-center py-4 text-left text-xl font-bold focus:outline-none">
              {section.title}
              <FaChevronDown
                className={`text-gray-600 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Accordion Body with Transition */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}>
              <div className="space-y-4 mt-2">
                {section.jobs.map((job, jobIdx) => (
                  <div key={job.id}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <p className="font-semibold text-lg">
                          {jobIdx + 1}. {job.title}
                        </p>
                        {job.subtitle && (
                          <p className="text-sm text-gray-600">
                            {job.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-10 sm:w-full sm:justify-between">
                        <p className="text-sm text-gray-800">
                          {job.type} | {job.mode} | {job.location}
                        </p>
                        <div className="flex justify-end mt-1">
                          <Link
                            to={`/nomad/career`}
                            className="border-2 border-gray-600 p-2 rounded-md hover:bg-black hover:text-white transition-colors">
                            <FaChevronRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                    {section.jobs.length > 1 &&
                      jobIdx < section.jobs.length - 1 && (
                        <hr className="mt-4" />
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Jobrole;
