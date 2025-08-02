// Career.jsx
import React from "react";
import Jobrole from "./Jobrole"; // Make sure path is correct
import Container from "../components/Container";

const Career = () => {
  return (
    <Container padding={false}>
      <div className="">
        <h3 className="text-4xl md:text-6xl font-semibold mb-6">
          JOIN OUR TEAM
        </h3>
        <h2 className="text-xl md:text-3xl font-bold mb-4">OPEN POSITION</h2>
        <div className="border-b-2 border-gray-300 w-[5%] mb-6"></div>
        <Jobrole />
      </div>

      {/* extra spacing below to match current wono website (Current as in: as of 02-08-2025) */}
      <div className="py-20"></div>
    </Container>
  );
};

export default Career;
