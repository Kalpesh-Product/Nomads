
import React from "react";
import Container from "./Container";

const MySeperator = () => {
  return (
    <div>
      <Container padding={false}>
        <div className="border-t-2 border-gray-300 h-[0.5rem]" ></div>
      </Container>
    </div>
  );
};

export default MySeperator;
