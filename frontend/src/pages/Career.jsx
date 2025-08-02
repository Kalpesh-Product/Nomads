// Career.jsx
import React from "react";
import Jobrole from "./Jobrole"; // Make sure path is correct

const Career = () => {
  return (
    <div className="px-4 md:px-12 lg:px-24 py-6">
      <h3 className="text-4xl md:text-6xl font-semibold mb-6">JOIN OUR TEAM</h3>
      <div className="border-b-4 border-orange-500 w-1/12 mb-6"></div>
      <h2 className="text-xl md:text-3xl font-bold mb-8">OPEN POSITION</h2>
      <Jobrole />
    </div>
  );
};

export default Career;
