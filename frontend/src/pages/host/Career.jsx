import { Container } from '@mui/material';
import React from 'react';
import Jobrole from '../Jobrole';

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
      title: "II. Tech",
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
    {
      title: "III. Finance",
      jobs: [
        {
          id: 6,
          title: "Finance Intern",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
    {
      title: "IV. HR & EA",
      jobs: [
        {
          id: 7,
          title: "HR Generalist",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
        {
          id: 8,
          title: "Executive Assistant to CEO",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
    {
      title: "V. Sales",
      jobs: [
        {
          id: 9,
          title: "Sr.Manager Sales & Business Development",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
    {
      title: "VI. Marketing",
      jobs: [
        {
          id: 10,
          title: "Social Media Executive",
          type: "Full-Time",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
    {
      title: "VII. Internships",
      jobs: [
        {
          id: 11,
          title: "Internships Across Departments",
          subtitle:
            "- APPLY NOW *Mention your applying department in the message box",
          type: "Internships",
          mode: "On-Site",
          location: "Goa",
        },
      ],
    },
  ];

const HostCareer = () => {
  return (
     <Container padding={false}>
      <div className="">
        <h3 className="text-4xl md:text-6xl font-semibold mb-6">
          JOIN OUR TEAM
        </h3>
        <h2 className="text-xl md:text-3xl font-bold mb-4">OPEN POSITION</h2>
        <div className="border-b-2 border-gray-300 w-[5%] mb-6"></div>
        <Jobrole jobRoles={jobRoles}/>
      </div>

      {/* extra spacing below to match current wono website (Current as in: as of 02-08-2025) */}
      <div className="py-20"></div>
    </Container>
  );
};

export default HostCareer;
 